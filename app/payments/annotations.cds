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
    },


    
    {
      $Type: 'UI.DataField',
      Value: PmtMtd ,
      Label: 'Payment Method '
    },
    {
      $Type: 'UI.DataField',
      Value: CmpCode ,
      Label: 'Company Code '
    },
    {
      $Type: 'UI.DataField',
      Value: ReqdExctnDt ,
      Label: 'Requested Execution Date'
    },
    {
      $Type: 'UI.DataField',
      Value: CompanyCodeName ,
      Label: 'Company Code Name'
    },
    {
      $Type: 'UI.DataField',
      Value: pNbOfTxs ,
      Label: 'Processed Number Of Transcations'
    },
    {
      $Type: 'UI.DataField',
      Value: pCtrlSum ,
      Label: 'Processed Control Sum'
    },
  ],

  UI.HeaderInfo: {
    TypeName: 'Payment File',
    TypeNamePlural: 'Payment Files',
    Title: { Value: fileIdentifier }
  }
);








