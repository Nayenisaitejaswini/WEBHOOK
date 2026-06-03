const cds = require('@sap/cds');
const xml2js = require('xml2js');

module.exports = cds.service.impl(async function () {
  const { PaymentFiles } = this.entities;

  this.on('uploadXML', async (req) => {
    const { fileName, xmlContent } = req.data;

    if (!xmlContent) {
      return JSON.stringify({ error: 'XML content is empty' }, null, 2);
    }

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false
    });

    const parsed = await parser.parseStringPromise(xmlContent);

    const doc = parsed.Document;
    const initn = doc.CstmrCdtTrfInitn;
    const grpHdr = initn.GrpHdr;
    const pmtInf = initn.PmtInf;
    const tx = pmtInf.CdtTrfTxInf;

    const instructedAmount = tx.Amt.InstdAmt;
    const amount =
      typeof instructedAmount === 'object'
        ? instructedAmount._
        : instructedAmount;

    const currency =
      instructedAmount.$?.Ccy || pmtInf.DbtrAcct.Ccy || 'INR';

    const debtorAccount =
      pmtInf.DbtrAcct.Id.Othr.Id;

    const debtorScheme =
      pmtInf.DbtrAcct.Id.Othr.SchmeNm?.Cd || '';

    const creditorAccount =
      tx.CdtrAcct.Id.Othr.Id;

    const creditorIFSC =
      tx.CdtrAcct.Id.Othr.SchmeNm?.Cd ||
      tx.CdtrAgt.FinInstnId.ClrSysMmbId.MmbId;

    const creditorName = tx.Cdtr.Nm;

    const creditorEmail =
      tx.Cdtr.EmailID ||
      tx.Cdtr.CtctDtls?.EmailAdr ||
      '';

    const creditorMobile =
      tx.Cdtr.MobileNo || '';

    const addressLineRaw =
      tx.CdtrAgt.FinInstnId.PstlAdr?.AdrLine || [];

    const addressLine = Array.isArray(addressLineRaw)
      ? addressLineRaw
      : [addressLineRaw];

    const remarks =
      tx.RmtInf?.Strd?.RfrdDocInf?.NbText ||
      tx.RmtInf?.Strd?.RfrdDocInf?.Nb ||
      'Payment';

    const yesBankPayload = {
      Data: {
        FileIdentifier: grpHdr.MsgId,
        NumberOfTransactions: grpHdr.NbOfTxs,
        ConsentId: '256660',
        ControSum: grpHdr.CtrlSum,
        SecondaryIdentification: '256660',
        DomesticPayments: [
          {
            ConsentId: '256660',
            Initiation: {
              InstructionIdentification: tx.PmtId.InstrId,
              EndToEndIdentification: tx.PmtId.EndToEndId,
              ClearingSystemIdentification: 'NEFT',
              InstructedAmount: {
                Amount: amount,
                Currency: currency
              },
              DebtorAccount: {
                SchemeName: debtorScheme,
                Identification: debtorAccount,
                Name: 'GOVIND MILK PRODUCTS',
                SecondaryIdentification: '256660',
                Unstructured: {
                  ContactInformation: {},
                  Identities: {}
                }
              },
              CreditorAccount: {
                SchemeName: creditorIFSC,
                Identification: creditorAccount,
                Name: creditorName,
                Unstructured: {
                  ContactInformation: {
                    EmailAddress: creditorEmail,
                    MobileNumber: creditorMobile
                  },
                  Identities: {}
                }
              },
              RemittanceInformation: {
                Unstructured: {
                  CreditorReferenceInformation: remarks,
                  RemitterAccount: debtorAccount
                }
              }
            },
            Risk: {
              PaymentContextCode: 'BankTransfer',
              DeliveryAddress: {
                Country: 'IN',
                AddressLine: addressLine
              }
            }
          }
        ]
      }
    };

    await INSERT.into(PaymentFiles).entries({
      ID: cds.utils.uuid(),
      fileIdentifier: grpHdr.MsgId,
      numberOfTransactions: Number(grpHdr.NbOfTxs),
      consentId: '256660',
      controlSum: Number(grpHdr.CtrlSum),
      secondaryIdentification: '256660',
      yesBankPayload: JSON.stringify(yesBankPayload, null, 2),
      createdAt: new Date()
    });

    return JSON.stringify(yesBankPayload, null, 2);
  });
});