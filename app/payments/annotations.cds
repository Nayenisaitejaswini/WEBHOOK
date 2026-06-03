using PaymentService as service from '../../srv/service';

annotate service.PaymentFiles with @(
  UI.LineItem: [
    { Value: fileIdentifier },
    { Value: numberOfTransactions },
    { Value: controlSum },
    { Value: consentId },
    { Value: createdAt },
    { @UI.DataFieldForAction: { Action: 'ViewPayload', Label: 'View Payload', RequiresContext: true } }
  ],
  UI.HeaderInfo: {
    TypeName: 'Payment File',
    TypeNamePlural: 'Payment Files',
    Title: { Value: fileIdentifier }
  }
);