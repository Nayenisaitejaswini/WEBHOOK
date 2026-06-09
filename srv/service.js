const cds = require('@sap/cds');
const xml2js = require('xml2js');

module.exports = cds.service.impl(async function () {
    const { PaymentFiles } = this.entities;

    // Upload XML only
    this.on('uploadXML', async (req) => {
        const { fileName, xmlContent } = req.data;
        if (!xmlContent) return { error: "XML content is empty" };

        // Store XML only, no payload generation
        await INSERT.into(PaymentFiles).entries({
            ID: cds.utils.uuid(),
            fileIdentifier: fileName,
            xmlContent,       // store full XML
            createdAt: new Date()
        });

        return { message: "XML uploaded successfully" };
    });

    // Generate Payload from uploaded XML
    this.on('generatePayload', async (req) => {
    const { fileIdentifier } = req.data;
    if (!fileIdentifier) return { error: "File Identifier required" };

    const fileEntry = await SELECT.from(PaymentFiles).where({ fileIdentifier });
    if (!fileEntry || fileEntry.length === 0) return { error: "File not found" };

    const xmlContent = fileEntry[0].xmlContent;
    const parser = new (require('xml2js').Parser)({ explicitArray: false, ignoreAttrs: false });

    try {
        const parsed = await parser.parseStringPromise(xmlContent);
        const payload = buildYesBankPayload(parsed);

        console.log("===== YES Bank Payload START =====");
        console.log(JSON.stringify(payload, null, 2));
        console.log("===== YES Bank Payload END =====");

        return payload;

    } catch (err) {
        console.error("XML parsing error:", err);
        return { error: "Failed to parse XML" };
    }
});

   function buildYesBankPayload(parsed) {
    const initn = parsed?.Document?.CstmrCdtTrfInitn;
    if (!initn) return {};

    const grpHdr = initn.GrpHdr;
    const pmtInf = initn.PmtInf;
    const txs = Array.isArray(pmtInf.CdtTrfTxInf) ? pmtInf.CdtTrfTxInf : [pmtInf.CdtTrfTxInf];

    const domesticPayments = txs.map(tx => ({
        ConsentId: "256660",
        Initiation: {
            InstructionIdentification: tx.PmtId?.InstrId || "",
            EndToEndIdentification: tx.PmtId?.EndToEndId || "",
            ClearingSystemIdentification: tx.ClearingSystemIdentification || "NEFT",
            InstructedAmount: {
                Amount: tx.Amt?.InstdAmt?._ || tx.Amt?.InstdAmt || "",
                Currency: tx.Amt?.InstdAmt?.$?.Ccy || "INR"
            },
            DebtorAccount: {
                SchemeName: tx.DbtrAcct?.Id?.Othr?.SchmeNm?.Cd || "",
                Identification: tx.DbtrAcct?.Id?.Othr?.Id || "",
                Name: tx.DbtrAcct?.Nm || "Unknown",
                SecondaryIdentification: "256660",
                Unstructured: {
                    ContactInformation: {
                        MobileNumber: tx.DbtrAcct?.CtctDtls?.MobNb || ""
                    },
                    Identities: {
                        MobileNumber: tx.DbtrAcct?.CtctDtls?.MobNb || ""
                    }
                }
            },
            CreditorAccount: {
                SchemeName: tx.CdtrAcct?.Id?.Othr?.SchmeNm?.Cd || "",
                Identification: tx.CdtrAcct?.Id?.Othr?.Id || "",
                Name: tx.Cdtr?.Nm || "",
                Unstructured: {
                    ContactInformation: {
                        EmailAddress: tx.Cdtr?.CtctDtls?.EmailAdr || "",
                        MobileNumber: tx.Cdtr?.CtctDtls?.MobNb || ""
                    },
                    Identities: {}
                }
            },
            RemittanceInformation: {
                Unstructured: {
                    CreditorReferenceInformation: tx.RmtInf?.Strd?.RfrdDocInf?.NbText || "",
                    RemitterAccount: tx.DbtrAcct?.Id?.Othr?.Id || ""
                }
            }
        },
        Risk: {
            PaymentContextCode: "BankTransfer",
            DeliveryAddress: {
                Country: tx.CdtrAgt?.FinInstnId?.PstlAdr?.Ctry || "IN",
                AddressLine: Array.isArray(tx.CdtrAgt?.FinInstnId?.PstlAdr?.AdrLine)
                    ? tx.CdtrAgt.FinInstnId.PstlAdr.AdrLine
                    : [tx.CdtrAgt?.FinInstnId?.PstlAdr?.AdrLine].filter(Boolean)
            }
        }
    }));

    return {
        Data: {
            FileIdentifier: grpHdr?.MsgId || "",
            NumberOfTransactions: grpHdr?.NbOfTxs || txs.length,
            ConsentId: "256660",
            ControSum: grpHdr?.CtrlSum || "",
            SecondaryIdentification: "256660",
            DomesticPayments: domesticPayments
        }
    };
}
});