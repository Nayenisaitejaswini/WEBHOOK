const cds = require('@sap/cds');
const xml2js = require('xml2js');

module.exports = cds.service.impl(async function () {
  const { PaymentFiles } = this.entities;

  this.on('uploadXML', async (req) => {
    const { fileName, xmlContent } = req.data;
    if (!xmlContent) return { error: "XML content is empty" };

    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });
    try {
      const parsed = await parser.parseStringPromise(xmlContent);
      const initn = parsed?.Document?.CstmrCdtTrfInitn;
      if (!initn) return { error: "Invalid XML structure" };

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
            SecondaryIdentification: tx.DbtrAcct?.Othr?.Id || "",
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

      const yesBankPayload = {
        Data: {
          FileIdentifier: grpHdr?.MsgId || "",
          NumberOfTransactions: grpHdr?.NbOfTxs || txs.length,
          ConsentId: "256660",
          ControSum: grpHdr?.CtrlSum || "",
          SecondaryIdentification: "256660",
          DomesticPayments: domesticPayments
        }
      };

      await INSERT.into(PaymentFiles).entries({
        ID: cds.utils.uuid(),
        fileIdentifier: grpHdr?.MsgId || "",
        numberOfTransactions: Number(grpHdr?.NbOfTxs || txs.length),
        consentId: "256660",
        controlSum: Number(grpHdr?.CtrlSum || 0),
        secondaryIdentification: "256660",
        yesBankPayload: JSON.stringify(yesBankPayload, null, 2),
        createdAt: new Date()
      });

      console.log("===== YES Bank Payload START =====");
      console.log(JSON.stringify(yesBankPayload, null, 2));
      console.log("===== YES Bank Payload END =====");

      return JSON.stringify(yesBankPayload, null, 2);

    } catch (err) {
      console.error("XML parsing error:", err);
      return { error: "Failed to parse XML" };
    }
  });
});