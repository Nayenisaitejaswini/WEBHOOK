sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(MessageToast, MessageBox) {
    'use strict';

    return {
        submit: async function(oContext, aSelectedContexts) {
    if (!aSelectedContexts || aSelectedContexts.length === 0) {
        MessageToast.show("Please select a file first");
        return;
    }

    const oSelected = aSelectedContexts[0];
    const fileIdentifier = oSelected.getProperty("fileIdentifier");
    const numberOfTransactions = String(oSelected.getProperty("numberOfTransactions") || 0);
    const consentId = oSelected.getProperty("consentId") || "";
    const controlSum = String(oSelected.getProperty("controlSum") || 0);
    const secondaryIdentification = oSelected.getProperty("secondaryIdentification") || "";
    const paymentMethod = oSelected.getProperty("paymentMethod") || "FT";
    const amount = String(oSelected.getProperty("amount") || 0);
    const currency = oSelected.getProperty("currency") || "INR";
    const debtorBank = oSelected.getProperty("debtorBank") || "";
    const debtorAccount = oSelected.getProperty("debtorAccount") || "";
    const debtorName = oSelected.getProperty("debtorName") || "";
    const creditorBank = oSelected.getProperty("creditorBank") || "";
    const creditorAccount = oSelected.getProperty("creditorAccount") || "";
    const creditorName = oSelected.getProperty("creditorName") || "";
    const remittanceInfo = oSelected.getProperty("remittanceInfo") || "";
    const creditorCountry = oSelected.getProperty("creditorCountry") || "IN";
    const creditorMobile = oSelected.getProperty("creditorMobile") || "";

    const Data = {
        FileIdentifier: fileIdentifier,
        NumberOfTransactions: numberOfTransactions,
        ConsentId: consentId,
        ControSum: controlSum,
        SecondaryIdentification: secondaryIdentification,
        DomesticPayments: [
            {
                ConsentId: consentId,
                Initiation: {
                    InstructionIdentification: secondaryIdentification,
                    ClearingSystemIdentification: paymentMethod,
                    InstructedAmount: { Amount: amount, Currency: currency },
                    DebtorAccount: {
                        SchemeName: debtorBank,
                        Identification: debtorAccount,
                        Name: debtorName,
                        SecondaryIdentification: consentId,
                        Unstructured: { ContactInformation: { MobileNumber: creditorMobile || "9922919744" } }
                    },
                    CreditorAccount: {
                        SchemeName: creditorBank,
                        Identification: creditorAccount,
                        Name: creditorName
                    },
                    RemittanceInformation: {
                        Unstructured: {
                            CreditorReferenceInformation: remittanceInfo || "Diwali",
                            RemitterAccount: debtorAccount
                        }
                    }
                },
                Risk: {
                    PaymentContextCode: "BankTransfer",
                    DeliveryAddress: { Country: creditorCountry || "IN", AddressLine: ["PHALTAN"] }
                }
            }
        ]
    };

    try {
        const response = await fetch("/odata/v4/payment/generatePayload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileIdentifier, Data: JSON.stringify(Data) }) // include Data as stringified JSON
        });

        if (!response.ok) {
            MessageBox.error("Payload generation failed");
            return;
        }

        const payload = await response.json();
        console.log("===== Generated JSON Payload =====");
        console.log(payload.yesBankPayload); // the JSON string
        MessageToast.show("JSON Payload generated! Check terminal.");

    } catch (err) {
        MessageBox.error("Generate payload failed: " + err.message);
    }
}
    };
});