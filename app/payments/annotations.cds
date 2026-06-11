using PaymentService as service from '../../srv/service';

annotate service.PaymentFiles with @(

  UI.SelectionFields: [ fileIdentifier, consentId ],

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: fileIdentifier, Label: 'File Identifier' },
    { $Type: 'UI.DataField', Value: numberOfTransactions, Label: 'Transactions' },
    { $Type: 'UI.DataField', Value: controlSum, Label: 'Control Sum' },
    { $Type: 'UI.DataField', Value: consentId, Label: 'Consent ID' },
    { $Type: 'UI.DataField', Value: createdAt, Label: 'Created At' },
    { $Type: 'UI.DataField', Value: paymentMethod, Label: 'Payment Method' },
    { $Type: 'UI.DataField', Value: CmpCode, Label: 'Company Code' },
    { $Type: 'UI.DataField', Value: executionDate, Label: 'Requested Execution Date' },
    { $Type: 'UI.DataField', Value: CompanyCodeName, Label: 'Company Code Name' },
    { $Type: 'UI.DataField', Value: pNbOfTxs, Label: 'Processed Number Of Transactions' },
    { $Type: 'UI.DataField', Value: pCtrlSum, Label: 'Processed Control Sum' }
  ],

  UI.HeaderInfo: {
    TypeName: 'Payment File',
    TypeNamePlural: 'Payment Files',
    Title: { Value: fileIdentifier }
  },

  UI.Identification: [
    { $Type: 'UI.DataField', Value: fileIdentifier }
  ],

  UI.FieldGroup #GeneralInfo : {
    Label: 'General Information',
    Data: [
      { $Type: 'UI.DataField', Value: fileIdentifier },
      { $Type: 'UI.DataField', Value: consentId },
      { $Type: 'UI.DataField', Value: createdAt }
    ]
  },

  UI.FieldGroup #PaymentDetails : {
    Label: 'Payment Details',
    Data: [
      { $Type: 'UI.DataField', Value: paymentMethod },
      { $Type: 'UI.DataField', Value: executionDate },
      { $Type: 'UI.DataField', Value: CmpCode },
      { $Type: 'UI.DataField', Value: CompanyCodeName },
      { $Type: 'UI.DataField', Value: numberOfTransactions },
      { $Type: 'UI.DataField', Value: controlSum },
      { $Type: 'UI.DataField', Value: pNbOfTxs },
      { $Type: 'UI.DataField', Value: pCtrlSum }
    ]
  },

  UI.FieldGroup #TransactionDetails : {
    Label: 'Transaction Details',
    Data: [
      { $Type: 'UI.DataField', Value: secondaryIdentification },
      { $Type: 'UI.DataField', Value: endToEndId },
      { $Type: 'UI.DataField', Value: amount },
      { $Type: 'UI.DataField', Value: currency }
    ]
  },

  UI.FieldGroup #DebtorInfo : {
    Label: 'Debtor Information',
    Data: [
      { $Type: 'UI.DataField', Value: debtorName },
      { $Type: 'UI.DataField', Value: debtorAccount },
      { $Type: 'UI.DataField', Value: debtorBank },
      { $Type: 'UI.DataField', Value: debtorCountry },
      { $Type: 'UI.DataField', Value: debtorEmail }
    ]
  },

  UI.FieldGroup #CreditorInfo : {
    Label: 'Creditor Information',
    Data: [
      { $Type: 'UI.DataField', Value: creditorName },
      { $Type: 'UI.DataField', Value: creditorAccount },
      { $Type: 'UI.DataField', Value: creditorBank },
      { $Type: 'UI.DataField', Value: creditorCountry },
      { $Type: 'UI.DataField', Value: creditorEmail },
      { $Type: 'UI.DataField', Value: creditorMobile }
    ]
  },

  UI.FieldGroup #TaxInfo : {
    Label: 'Tax Information',
    Data: [
      { $Type: 'UI.DataField', Value: taxId },
      { $Type: 'UI.DataField', Value: taxRef },
      { $Type: 'UI.DataField', Value: taxDate },
      { $Type: 'UI.DataField', Value: taxType },
      { $Type: 'UI.DataField', Value: taxAmount }
    ]
  },

  UI.FieldGroup #RemittanceInfo : {
    Label: 'Remittance & Adjustments',
    Data: [
      { $Type: 'UI.DataField', Value: invoiceNumber },
      { $Type: 'UI.DataField', Value: invoiceReference },
      { $Type: 'UI.DataField', Value: remittanceInfo },
      { $Type: 'UI.DataField', Value: duePayableAmount },
      { $Type: 'UI.DataField', Value: remittedAmount },
      { $Type: 'UI.DataField', Value: taxAmountRef },
      { $Type: 'UI.DataField', Value: adjustmentReason },
      { $Type: 'UI.DataField', Value: adjustmentType }
    ]
  },

  UI.Facets: [
    {
      $Type: 'UI.CollectionFacet',
      ID: 'GeneralFacet',
      Label: 'General & Payment Info',
      Facets: [
        { $Type: 'UI.ReferenceFacet', Label: 'General Info', Target: '@UI.FieldGroup#GeneralInfo' },
        { $Type: 'UI.ReferenceFacet', Label: 'Payment Details', Target: '@UI.FieldGroup#PaymentDetails' },
        { $Type: 'UI.ReferenceFacet', Label: 'Transaction Details', Target: '@UI.FieldGroup#TransactionDetails' }
      ]
    }
    /*,
    {
      $Type: 'UI.CollectionFacet',
      ID: 'PartiesFacet',
      Label: 'Parties Information',
      Facets: [
        { $Type: 'UI.ReferenceFacet', Label: 'Debtor Information', Target: '@UI.FieldGroup#DebtorInfo' },
        { $Type: 'UI.ReferenceFacet', Label: 'Creditor Information', Target: '@UI.FieldGroup#CreditorInfo' }
      ]
    },
    {
      $Type: 'UI.CollectionFacet',
      ID: 'TaxRemittanceFacet',
      Label: 'Tax & Remittance Info',
      Facets: [
        { $Type: 'UI.ReferenceFacet', Label: 'Tax Information', Target: '@UI.FieldGroup#TaxInfo' },
        { $Type: 'UI.ReferenceFacet', Label: 'Remittance & Adjustments', Target: '@UI.FieldGroup#RemittanceInfo' }
      ]
    }*/
  ]
);