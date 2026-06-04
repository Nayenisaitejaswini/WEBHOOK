const cds = require('@sap/cds');
const xml2js = require('xml2js');

module.exports = cds.service.impl(async function () {
  const { PaymentFiles } = this.entities;

  this.on('uploadXML', async (req) => {
    const { fileName, xmlContent } = req.data;

    if (!xmlContent) return JSON.stringify({ error: "XML content is empty" });

    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });

    try {
      const parsed = await parser.parseStringPromise(xmlContent);

      if (!parsed?.Document?.CstmrCdtTrfInitn) {
        console.error("Invalid XML structure:", xmlContent);
        return JSON.stringify({ error: "Invalid XML structure" });
      }

      const initn = parsed.Document.CstmrCdtTrfInitn;
      const grpHdr = initn.GrpHdr;
      const pmtInf = initn.PmtInf;
      const tx = Array.isArray(pmtInf.CdtTrfTxInf) ? pmtInf.CdtTrfTxInf[0] : pmtInf.CdtTrfTxInf;

      const amount = typeof tx.Amt.InstdAmt === "object" ? tx.Amt.InstdAmt._ : tx.Amt.InstdAmt;
      const currency = tx.Amt.InstdAmt?.$?.Ccy || "INR";

      const yesBankPayload = {
        Data: {
          FileIdentifier: grpHdr?.MsgId || "",
          NumberOfTransactions: grpHdr?.NbOfTxs || "0",
          ConsentId: "256660",
          ControSum: grpHdr?.CtrlSum || "0",
          SecondaryIdentification: "256660",
          DomesticPayments: [
            {
              ConsentId: "256660",
              Initiation: {
                InstructionIdentification: tx?.PmtId?.InstrId || "",
                EndToEndIdentification: tx?.PmtId?.EndToEndId || "",
                ClearingSystemIdentification: "NEFT",
                InstructedAmount: { Amount: amount, Currency: currency }
              }
            }
          ]
        }
      };

      await INSERT.into(PaymentFiles).entries({
        ID: cds.utils.uuid(),
        fileIdentifier: grpHdr?.MsgId || "",
        numberOfTransactions: Number(grpHdr?.NbOfTxs || 0),
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
      return JSON.stringify({ error: "Failed to parse XML" });
    }
  });
});