sap.ui.define([
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/ui/unified/FileUploader"
], function (MessageToast, MessageBox, Dialog, Button, FileUploader) {
  "use strict";

  return {
    onUploadXML: function () {
      MessageToast.show("Button clicked");

      const oFileUploader = new FileUploader({
        width: "100%",
        fileType: ["xml"],
        placeholder: "Choose XML file"
      });

      const oDialog = new Dialog({
        title: "Upload XML File",
        contentWidth: "450px",
        content: [oFileUploader],

        beginButton: new Button({
          text: "Upload",
          press: function () {
            const file = oFileUploader.oFileUpload.files[0];

            if (!file) {
              MessageToast.show("Please select XML file");
              return;
            }

            const reader = new FileReader();

            reader.onload = async function (e) {
              const xmlContent = e.target.result;

              try {
                console.log("XML Content:", xmlContent);

                const response = await fetch("/odata/v4/payment/uploadXML", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    fileName: file.name,
                    xmlContent: xmlContent
                  })
                });

                if (!response.ok) {
                  const errorText = await response.text();
                  console.error("Backend error:", errorText);
                  MessageBox.error("Backend call failed. Check terminal.");
                  return;
                }

                const data = await response.json();

                console.log("YES Bank Payload:", data.value);

                MessageBox.success("Payload generated successfully. Check browser console and VS Code terminal.");

                oDialog.close();

              } catch (err) {
                console.error("Upload failed:", err);
                MessageBox.error("Upload failed: " + err.message);
              }
            };

            reader.readAsText(file);
          }
        }),

        endButton: new Button({
          text: "Cancel",
          press: function () {
            oDialog.close();
          }
        }),

        afterClose: function () {
          oDialog.destroy();
        }
      });

      oDialog.open();
    }
  };
});