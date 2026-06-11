using PaymentService as service from '../../srv/service';

annotate service.PaymentFiles with @(

  UI.SelectionFields: [ fileIdentifier, consentId ],

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
      Value: paymentMethod, 
      Label: 'Payment Method' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: CmpCode, 
      Label: 'Company Code' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: executionDate, 
      Label: 'Requested Execution Date' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: CompanyCodeName, 
      Label: 'Company Code Name' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: pNbOfTxs, 
      Label: 'Processed Number Of Transactions' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: pCtrlSum, 
      Label: 'Processed Control Sum' 
    }
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

  UI.FieldGroup #PaymentInfo : {
    Label: 'Payment Information',
    Data: [
      { 
        $Type: 'UI.DataField', 
        Value: paymentMethod, 
        Label: 'Payment Method' 
      },
      { 
        $Type: 'UI.DataField', 
        Value: CompanyCodeName, 
        Label: 'Company Name' 
      },
      { 
        $Type: 'UI.DataField', 
        Value: numberOfTransactions, 
        Label: 'Number of Transactions' 
      },
      { 
        $Type: 'UI.DataField', 
        Value: CmpCode, 
        Label: 'Company Code' 
      },
      { 
        $Type: 'UI.DataField', 
        Value: executionDate, 
        Label: 'Requested Execution Date' 
      },
      { 
        $Type: 'UI.DataField', 
        Value: controlSum, 
        Label: 'Control Sum' 
      }
    ]
  },

  UI.FieldGroup #DebtorInfo : {
    Label: 'Debtor Information',
    Data: [
      { 
      $Type: 'UI.DataField', 
      Value: debtorCountry, 
      Label: 'Debtor Country' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: debtorAccount, 
      Label: 'Debtor Account ID' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: debtorAgentCountry, 
      Label: 'Debtor Agent Country' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: debtorName, 
      Label: 'Debtor Name' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: debtorEmail, 
      Label: 'Debtor Email' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: debtorAgentScheme, 
      Label: 'Debtor Agent Scheme' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: debtorAgentIfscCode, 
      Label: 'Debtor Agent IFSC Code' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: debtorBranch, 
      Label: 'Debtor Branch' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: debtorCountryOfResidence, 
      Label: 'Debtor Country of Residence' 
    },
    { 
      $Type: 'UI.DataField', 
      Value: debtorAccountCcy, 
      Label: 'Debtor Account Ccy' 
    }
    ]
  },

  UI.Facets: [
    {
      $Type: 'UI.ReferenceFacet',
      ID: 'PaymentInfoFacet',
      Label: 'Payment Information',
      Target: '@UI.FieldGroup#PaymentInfo'
    },
    {
      $Type: 'UI.ReferenceFacet',
      ID: 'DebtorInfoFacet',
      Label: 'Debtor Information',
      Target: '@UI.FieldGroup#DebtorInfo'
    }
  ]
);