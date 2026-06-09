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

    const fileIdentifier = aSelectedContexts[0].getProperty("fileIdentifier");

    // TODO: provide your JSON payload here (example)
    const Data = {
        FileIdentifier: fileIdentifier,
        NumberOfTransactions: "2",
        ConsentId: "256660",
        ControSum: "10",
        SecondaryIdentification: "256660",
        DomesticPayments: [
            {
                ConsentId: "256660",
                Initiation: {
                    InstructionIdentification: "VVV3",
                    ClearingSystemIdentification: "FT",
                    InstructedAmount: { Amount: "5", Currency: "INR" },
                    DebtorAccount: {
                        SchemeName: "YESB00SMSBL",
                        Identification: "001081300000304",
                        Name: "GOVIND MILK PRODUCTS",
                        SecondaryIdentification: "256660",
                        Unstructured: { ContactInformation: { MobileNumber: "9922919744" } }
                    },
                    CreditorAccount: {
                        SchemeName: "YESB0000001",
                        Identification: "041583800000162",
                        Name: "AACita Dattatray Nimbalkar"
                    },
                    RemittanceInformation: {
                        Unstructured: {
                            CreditorReferenceInformation: "Diwali",
                            RemitterAccount: "816002021000038"
                        }
                    }
                },
                Risk: {
                    PaymentContextCode: "BankTransfer",
                    DeliveryAddress: { Country: "IN", AddressLine: ["PHALTAN"] }
                }
            }
        ]
    };

    try {
        const response = await fetch("/odata/v4/payment/generatePayload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileIdentifier, Data }) // include Data
        });

        if (!response.ok) {
            MessageBox.error("Payload generation failed");
            return;
        }

        const payload = await response.json();
        console.log("===== Generated Payload =====");
        console.log(payload.xmlContent); // the XML string
        MessageToast.show("Payload generated! Check terminal.");

    } catch (err) {
        MessageBox.error("Generate payload failed: " + err.message);
    }
}
    };
});