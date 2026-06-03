sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"payments/test/integration/pages/PaymentFilesList",
	"payments/test/integration/pages/PaymentFilesObjectPage"
], function (JourneyRunner, PaymentFilesList, PaymentFilesObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('payments') + '/test/flp.html#app-preview',
        pages: {
			onThePaymentFilesList: PaymentFilesList,
			onThePaymentFilesObjectPage: PaymentFilesObjectPage
        },
        async: true
    });

    return runner;
});

