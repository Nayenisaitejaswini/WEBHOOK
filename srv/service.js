const cds = require('@sap/cds');
const xml2js = require('xml2js');

module.exports = cds.service.impl(async function () {
    const { PaymentFiles } = this.entities;

    this.on('uploadXML', async (req) => {
        const { fileName, xmlContent } = req.data;

        let parsedXml;
        try {
            parsedXml = await xml2js.parseStringPromise(xmlContent, { explicitArray: false });
        } catch (err) {
            req.error(400, `Invalid XML: ${err.message}`);
        }

        const grpHdr = parsedXml?.Document?.CstmrCdtTrfInitn?.GrpHdr;
        const pmtInf = parsedXml?.Document?.CstmrCdtTrfInitn?.PmtInf;
        const transactions = Array.isArray(pmtInf?.CdtTrfTxInf) ? pmtInf.CdtTrfTxInf : [pmtInf.CdtTrfTxInf];

        for (const tx of transactions) {
            const tax = tx?.Tax;
            const rmt = tx?.RmtInf?.Strd;
            const adj = rmt?.RfrdDocAmt?.AdjstmntAmtAndRsn;

            const newRecord = {
                ID: cds.utils.uuid(),
                fileIdentifier: fileName,
                createdAt: new Date(),
                yesBankPayload: xmlContent,
                xmlContent: xmlContent,

                // Group Header
                consentId: grpHdr?.MsgId || '',
                numberOfTransactions: parseInt(grpHdr?.NbOfTxs || 0),
                controlSum: parseFloat(grpHdr?.CtrlSum || 0),

                // Transaction info
                secondaryIdentification: tx?.PmtId?.InstrId || '',
                endToEndId: tx?.PmtId?.EndToEndId || '',
                paymentMethod: pmtInf?.PmtMtd || '',
                executionDate: pmtInf?.ReqdExctnDt || '',
                amount: parseFloat(tx?.Amt?.InstdAmt?._ || 0),
                currency: tx?.Amt?.InstdAmt?.$.Ccy || '',

                // Debtor
                debtorName: pmtInf?.Dbtr?.Nm || '',
                debtorAccount: pmtInf?.DbtrAcct?.Id?.Othr?.Id || '',
                debtorBank: pmtInf?.DbtrAgt?.FinInstnId?.ClrSysMmbId?.MmbId || '',

                // Creditor
                creditorName: tx?.Cdtr?.Nm || '',
                creditorAccount: tx?.CdtrAcct?.Id?.Othr?.Id || '',
                creditorBank: tx?.CdtrAgt?.FinInstnId?.ClrSysMmbId?.MmbId || '',

                // Tax
                taxId: tax?.Dbtr?.TaxId || '',
                taxRef: tax?.RefNb || '',
                taxDate: tax?.Dt || '',
                taxType: tax?.Rcrd?.Tp || '',
                taxAmount: parseFloat(tax?.Rcrd?.TaxAmt || 0),
                adjustmentReason: adj?.Rsn || '',
                adjustmentType: adj?.CdtDbtInd || '',

                // Remittance / Invoice
                invoiceNumber: rmt?.RfrdDocInf?.Invnb || '',
                invoiceReference: rmt?.RfrdDocInf?.Nb || '',
                remittanceInfo: rmt?.RfrdDocInf?.NbText || '',
                duePayableAmount: parseFloat(rmt?.RfrdDocAmt?.DuePyblAmt?._ || 0),
                remittedAmount: parseFloat(rmt?.RfrdDocAmt?.RmtdAmt?._ || 0),
                taxAmountRef: parseFloat(rmt?.RfrdDocAmt?.TaxAmt?._ || 0)
            };

            await INSERT.into(PaymentFiles).entries(newRecord);
        }

        return { message: `XML uploaded and ${transactions.length} transactions inserted successfully.` };
    });
    this.on('generatePayload', async (req) => {
    const { fileIdentifier, Data } = req.data;
    if (!fileIdentifier || !Data) req.error(400, 'fileIdentifier and Data are required');

    const builder = new Builder({ rootName: 'Document', xmldec: { version: '1.0', encoding: 'UTF-8' } });

    const xmlObj = { /* map your JSON payload to pain.001 XML as before */ };

    const xmlContent = builder.buildObject(xmlObj);

    // Optionally update the table
    await UPDATE(PaymentFiles).set({ xmlContent }).where({ fileIdentifier });

    console.log('Generated XML:', xmlContent);

    return { xmlContent };
});
});