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
            const cdtr = tx?.Cdtr;
            const dbtr = pmtInf?.Dbtr;
            const dbtrAcct = pmtInf?.DbtrAcct;
            const dbtrAgt = pmtInf?.DbtrAgt;

            const newRecord = {
                ID: cds.utils.uuid(),
                fileIdentifier: grpHdr?.MsgId || fileName,
                createdAt: new Date(),

                // Group Header
                consentId: grpHdr?.MsgId || '',
                numberOfTransactions: parseInt(grpHdr?.NbOfTxs || 0),
                controlSum: parseFloat(grpHdr?.CtrlSum || 0),

                // Payment info
                paymentMethod: pmtInf?.PmtMtd || '',
                executionDate: pmtInf?.ReqdExctnDt ? new Date(pmtInf?.ReqdExctnDt) : null,
                CmpCode: pmtInf?.CoCode || '',
                CompanyCodeName: grpHdr?.InitgPty?.Nm || '',
                pNbOfTxs: pmtInf?.NbOfTxs || 0,
                pCtrlSum: parseFloat(pmtInf?.CtrlSum || 0),

                // Transaction info
                secondaryIdentification: tx?.PmtId?.InstrId || '',
                endToEndId: tx?.PmtId?.EndToEndId || '',
                amount: parseFloat(tx?.Amt?.InstdAmt?._ || 0),
                currency: tx?.Amt?.InstdAmt?.$.Ccy || '',

                // Debtor info
                debtorName: dbtr?.Nm || '',
                debtorAccount: dbtrAcct?.Id?.Othr?.Id || '',
                debtorBank: dbtrAgt?.FinInstnId?.ClrSysMmbId?.MmbId || '',
                debtorCountry: dbtr?.PstlAdr?.Ctry || '',
                debtorEmail: dbtr?.PstlAdr?.EMail || '',

                // Creditor info
                creditorName: cdtr?.Nm || '',
                creditorAccount: tx?.CdtrAcct?.Id?.Othr?.Id || '',
                creditorBank: tx?.CdtrAgt?.FinInstnId?.ClrSysMmbId?.MmbId || '',
                creditorCountry: cdtr?.PstlAdr?.Ctry || '',
                creditorEmail: cdtr?.EmailID || cdtr?.CtctDtls?.EmailAdr || '',
                creditorMobile: cdtr?.MobileNo || '',

                // Tax info
                taxId: tax?.Dbtr?.TaxId || '',
                taxRef: tax?.RefNb || '',
                taxDate: tax?.Dt || null,
                taxType: tax?.Rcrd?.Tp || '',
                taxAmount: parseFloat(tax?.Rcrd?.TaxAmt || 0),
                adjustmentReason: adj?.Rsn || '',
                adjustmentType: adj?.CdtDbtInd || '',

                // Remittance / Invoice info
                invoiceNumber: rmt?.RfrdDocInf?.Invnb || '',
                invoiceReference: rmt?.RfrdDocInf?.Nb || '',
                remittanceInfo: rmt?.RfrdDocInf?.NbText || '',
                duePayableAmount: parseFloat(rmt?.RfrdDocAmt?.DuePyblAmt?._ || 0),
                remittedAmount: parseFloat(rmt?.RfrdDocAmt?.RmtdAmt?._ || 0),
                taxAmountRef: parseFloat(rmt?.RfrdDocAmt?.TaxAmt?._ || 0)
            };

            await INSERT.into(PaymentFiles).entries(newRecord);
        }

         // Build and print JSON Payload for YES Bank to terminal
        const domesticPayments = [];
        for (const tx of transactions) {
            const rmt = tx?.RmtInf?.Strd;

            // Extract amount & currency correctly
            let amountStr = "";
            let currencyStr = "INR";
            if (tx?.Amt?.InstdAmt) {
                if (typeof tx.Amt.InstdAmt === 'object') {
                    amountStr = tx.Amt.InstdAmt._ || "";
                    if (tx.Amt.InstdAmt.$ && tx.Amt.InstdAmt.$.Ccy) {
                        currencyStr = tx.Amt.InstdAmt.$.Ccy;
                    }
                } else {
                    amountStr = String(tx.Amt.InstdAmt);
                }
            }

            domesticPayments.push({
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
                        AddressLine: Array.isArray(tx?.Cdtr?.PstlAdr?.AdrLine) ? tx.Cdtr.PstlAdr.AdrLine : (tx?.Cdtr?.PstlAdr?.AdrLine ? [tx.Cdtr.PstlAdr.AdrLine] : ["PHALTAN"])
                    }
                }
            });
        }

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

    this.on('generatePayload', async (req) => {
        const { fileIdentifier, Data } = req.data;
        if (!fileIdentifier || !Data) req.error(400, 'fileIdentifier and Data are required');

        let parsedData = Data;
        if (typeof Data === 'string') {
            try {
                parsedData = JSON.parse(Data);
            } catch (err) {
                req.error(400, `Invalid Data format: ${err.message}`);
            }
        }

        console.log("\n=================== RECEIVED JSON PAYLOAD ===================");
        console.log(JSON.stringify(parsedData, null, 2));
        console.log("==============================================================\n");

        const domesticPayments = parsedData?.DomesticPayments || [];
        const firstPayment = domesticPayments[0];
        const initiation = firstPayment?.Initiation;
        const debtorAccount = initiation?.DebtorAccount;

        const cdtTrfTxInf = domesticPayments.map((pmt) => {
            const init = pmt.Initiation;
            const creditorAcc = init?.CreditorAccount;
            const remittance = init?.RemittanceInformation?.Unstructured;

            let instdAmt = {};
            if (init?.InstructedAmount?.Amount) {
                instdAmt = {
                    _: init.InstructedAmount.Amount,
                    $: { Ccy: init.InstructedAmount.Currency || 'INR' }
                };
            }

            return {
                PmtId: {
                    InstrId: init?.InstructionIdentification || '',
                    EndToEndId: init?.InstructionIdentification || ''
                },
                Amt: {
                    InstdAmt: instdAmt
                },
                Cdtr: {
                    Nm: creditorAcc?.Name || ''
                },
                CdtrAcct: {
                    Id: {
                        Othr: {
                            Id: creditorAcc?.Identification || ''
                        }
                    }
                },
                CdtrAgt: {
                    FinInstnId: {
                        ClrSysMmbId: {
                            MmbId: creditorAcc?.SchemeName || ''
                        }
                    }
                },
                RmtInf: {
                    Strd: {
                        RfrdDocInf: {
                            Nb: remittance?.CreditorReferenceInformation || ''
                        }
                    }
                }
            };
        });

        const xmlObj = {
            CstmrCdtTrfInitn: {
                GrpHdr: {
                    MsgId: parsedData?.ConsentId || '',
                    NbOfTxs: parsedData?.NumberOfTransactions || String(domesticPayments.length),
                    CtrlSum: parsedData?.ControSum || ''
                },
                PmtInf: {
                    PmtMtd: initiation?.ClearingSystemIdentification || 'FT',
                    ReqdExctnDt: new Date().toISOString().split('T')[0],
                    Dbtr: {
                        Nm: debtorAccount?.Name || ''
                    },
                    DbtrAcct: {
                        Id: {
                            Othr: {
                                Id: debtorAccount?.Identification || ''
                            }
                        }
                    },
                    DbtrAgt: {
                        FinInstnId: {
                            ClrSysMmbId: {
                                MmbId: debtorAccount?.SchemeName || ''
                            }
                        }
                    },
                    CdtTrfTxInf: cdtTrfTxInf
                }
            }
        };

        const builder = new xml2js.Builder({ rootName: 'Document', xmldec: { version: '1.0', encoding: 'UTF-8' } });
        const xmlContent = builder.buildObject(xmlObj);

        // Update the table
        await UPDATE(PaymentFiles).set({ xmlContent }).where({ fileIdentifier });

        console.log("\n=================== GENERATED XML PAYLOAD ===================");
        console.log(xmlContent);
        console.log("==============================================================\n");

        return { xmlContent };
    });
});