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

            try {
                const response = await fetch("/odata/v4/payment/generatePayload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fileIdentifier })
                });

                if (!response.ok) {
                    MessageBox.error("Payload generation failed");
                    return;
                }

                const payload = await response.json();
                console.log("===== YES Bank Payload =====");
                console.log(JSON.stringify(payload, null, 2));
                MessageToast.show("Payload generated! Check terminal.");

            } catch (err) {
                MessageBox.error("Generate payload failed: " + err.message);
            }
        }
    };
});