const cds = require('@sap/cds');
const xml2js = require('xml2js');

module.exports = cds.service.impl(async function () {
    const { PaymentFiles } = this.entities;

    // ------------------ Upload XML Action ------------------
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

        // Insert PaymentFiles record
        const newRecord = {
            ID: cds.utils.uuid(),
            fileIdentifier: grpHdr?.MsgId || fileName,
            createdAt: new Date(),
            xmlContent: xmlContent,
            consentId: grpHdr?.MsgId || '',
            numberOfTransactions: parseInt(grpHdr?.NbOfTxs || 0),
            controlSum: parseFloat(grpHdr?.CtrlSum || 0),
            secondaryIdentification: transactions[0]?.PmtId?.InstrId || '',
            endToEndId: transactions[0]?.PmtId?.EndToEndId || '',
            paymentMethod: pmtInf?.PmtMtd || '',
            executionDate: pmtInf?.ReqdExctnDt ? new Date(pmtInf?.ReqdExctnDt) : null,
            amount: parseFloat(transactions[0]?.Amt?.InstdAmt?._ || 0),
            currency: transactions[0]?.Amt?.InstdAmt?.$?.Ccy || '',
            CmpCode: pmtInf?.CoCode || '',
            CompanyCodeName: grpHdr?.InitgPty?.Nm || '',
            pNbOfTxs: pmtInf?.NbOfTxs || 0,
            pCtrlSum: parseFloat(pmtInf?.CtrlSum || 0),
            debtorName: pmtInf?.Dbtr?.Nm || '',
            debtorAccount: pmtInf?.DbtrAcct?.Id?.Othr?.Id || '',
            debtorBank: pmtInf?.DbtrAgt?.FinInstnId?.ClrSysMmbId?.MmbId || '',
            debtorCountry: pmtInf?.Dbtr?.PstlAdr?.Ctry || '',
            debtorEmail: pmtInf?.Dbtr?.PstlAdr?.EMail || '',
            creditorName: transactions[0]?.Cdtr?.Nm || '',
            creditorAccount: transactions[0]?.CdtrAcct?.Id?.Othr?.Id || '',
            creditorBank: transactions[0]?.CdtrAgt?.FinInstnId?.ClrSysMmbId?.MmbId || '',
            creditorCountry: transactions[0]?.Cdtr?.PstlAdr?.Ctry || '',
            creditorEmail: transactions[0]?.Cdtr?.EmailID || '',
            creditorMobile: transactions[0]?.Cdtr?.MobileNo || '',
            taxId: transactions[0]?.Tax?.Dbtr?.TaxId || '',
            taxRef: transactions[0]?.Tax?.RefNb || '',
            taxDate: transactions[0]?.Tax?.Dt || null,
            taxType: transactions[0]?.Tax?.Rcrd?.Tp || '',
            taxAmount: parseFloat(transactions[0]?.Tax?.Rcrd?.TaxAmt || 0),
            adjustmentReason: transactions[0]?.RmtInf?.Strd?.RfrdDocAmt?.AdjstmntAmtAndRsn?.Rsn || '',
            adjustmentType: transactions[0]?.RmtInf?.Strd?.RfrdDocAmt?.AdjstmntAmtAndRsn?.CdtDbtInd || '',
            invoiceNumber: transactions[0]?.RmtInf?.Strd?.RfrdDocInf?.Invnb || '',
            invoiceReference: transactions[0]?.RmtInf?.Strd?.RfrdDocInf?.Nb || '',
            remittanceInfo: transactions[0]?.RmtInf?.Strd?.RfrdDocInf?.NbText || '',
            duePayableAmount: parseFloat(transactions[0]?.RmtInf?.Strd?.RfrdDocAmt?.DuePyblAmt?._ || 0),
            remittedAmount: parseFloat(transactions[0]?.RmtInf?.Strd?.RfrdDocAmt?.RmtdAmt?._ || 0),
            taxAmountRef: parseFloat(transactions[0]?.RmtInf?.Strd?.RfrdDocAmt?.TaxAmt?._ || 0)
        };

        await INSERT.into(PaymentFiles).entries(newRecord);

        // Build JSON Payload for terminal
        const domesticPayments = transactions.map((tx) => {
            const rmt = tx?.RmtInf?.Strd;
            let amountStr = tx?.Amt?.InstdAmt?._ || "";
            let currencyStr = tx?.Amt?.InstdAmt?.$?.Ccy || "INR";

            return {
                ConsentId: grpHdr?.MsgId || '',
                Initiation: {
                    InstructionIdentification: tx?.PmtId?.InstrId || '',
                    ClearingSystemIdentification: pmtInf?.PmtMtd || 'FT',
                    InstructedAmount: { Amount: amountStr, Currency: currencyStr },
                    DebtorAccount: {
                        SchemeName: pmtInf?.DbtrAgt?.FinInstnId?.ClrSysMmbId?.MmbId || '',
                        Identification: pmtInf?.DbtrAcct?.Id?.Othr?.Id || '',
                        Name: pmtInf?.Dbtr?.Nm || '',
                        SecondaryIdentification: grpHdr?.MsgId || '',
                        Unstructured: { ContactInformation: { MobileNumber: "9922919744" } }
                    },
                    CreditorAccount: {
                        SchemeName: tx?.CdtrAgt?.FinInstnId?.ClrSysMmbId?.MmbId || '',
                        Identification: tx?.CdtrAcct?.Id?.Othr?.Id || '',
                        Name: tx?.Cdtr?.Nm || ''
                    },
                    RemittanceInformation: {
                        Unstructured: {
                            CreditorReferenceInformation: rmt?.RfrdDocInf?.Nb || tx?.RmtInf?.Ustrd || 'Diwali',
                            RemitterAccount: pmtInf?.DbtrAcct?.Id?.Othr?.Id || ''
                        }
                    }
                },
                Risk: {
                    PaymentContextCode: "BankTransfer",
                    DeliveryAddress: { 
                        Country: tx?.Cdtr?.PstlAdr?.Ctry || pmtInf?.Dbtr?.PstlAdr?.Ctry || "IN", 
                        AddressLine: Array.isArray(tx?.Cdtr?.PstlAdr?.AdrLine) ? tx.Cdtr.PstlAdr.AdrLine : [tx?.Cdtr?.PstlAdr?.AdrLine || "PHALTAN"]
                    }
                }
            };
        });

        const generatedJsonPayload = {
            FileIdentifier: fileName,
            NumberOfTransactions: grpHdr?.NbOfTxs || String(transactions.length),
            ConsentId: grpHdr?.MsgId || '',
            ControSum: grpHdr?.CtrlSum || '',
            SecondaryIdentification: grpHdr?.MsgId || '',
            DomesticPayments: domesticPayments
        };

        console.log("\n=================== GENERATED JSON PAYLOAD FROM XML ===================");
        console.log(JSON.stringify(generatedJsonPayload, null, 2));
        console.log("=======================================================================\n");

        return { message: `XML uploaded and ${transactions.length} transactions inserted successfully.` };
    });

    // ------------------ Generate Payload Action ------------------
    this.on('generatePayload', async (req) => {
        const { fileIdentifier, Data } = req.data;
        if (!fileIdentifier || !Data) req.error(400, 'fileIdentifier and Data are required');

        let parsedData = typeof Data === 'string' ? JSON.parse(Data) : Data;
        const jsonString = JSON.stringify(parsedData, null, 2);

        // Update PaymentFiles record with Yes Bank JSON payload
        await UPDATE(PaymentFiles).set({ yesBankPayload: jsonString }).where({ fileIdentifier });

        console.log("\n=================== GENERATED JSON PAYLOAD ===================");
        console.log(jsonString);
        console.log("==============================================================\n");

        return { yesBankPayload: jsonString };
    });
});