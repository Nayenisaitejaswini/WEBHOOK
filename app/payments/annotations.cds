using PaymentService as service from '../../srv/service';

annotate service.PaymentFiles with @(
  UI.SelectionFields: [
    fileIdentifier,
    consentId
  ],

  UI.LineItem: [
    {
      $Type: 'UI.DataField',
      Value: fileIdentifier,
      Label: 'File Identifier'
    },
    {
      $Type: 'UI.DataField',
      Value: numberOfTransactions,
      Label: 'Transactions'
    },
    {
      $Type: 'UI.DataField',
      Value: controlSum,
      Label: 'Control Sum'
    },
    {
      $Type: 'UI.DataField',
      Value: consentId,
      Label: 'Consent ID'
    },
    {
      $Type: 'UI.DataField',
      Value: createdAt,
      Label: 'Created At'
    }
  ],

  UI.HeaderInfo: {
    TypeName: 'Payment File',
    TypeNamePlural: 'Payment Files',
    Title: { Value: fileIdentifier }
  }
);








