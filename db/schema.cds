namespace webhook.payments;

entity PaymentFiles {
    key ID                         : UUID;
    fileIdentifier                  : String(100);
    createdAt                        : Timestamp;
    // yesBankPayload                   : LargeString;
    // xmlContent                       : LargeString;

    // Group Header
    consentId                        : String(50);  // MsgId
    numberOfTransactions              : Integer;     // NbOfTxs
    controlSum                        : Decimal(15,2); // CtrlSum

    // Transaction identifiers
    secondaryIdentification           : String(50); // InstrId
    endToEndId                        : String(50); // EndToEndId
    paymentMethod                     : String(10); // PmtMtd
    executionDate                     : Date;       // ReqdExctnDt
    amount                             : Decimal(18,2); // InstdAmt
    currency                           : String(5);  // InstdAmt Ccy

    // Debtor info
    debtorName                        : String(100); 
    debtorAccount                     : String(50);
    debtorBank                        : String(50);
    debtorCountry                     : String(5);
    debtorEmail                       : String(100);

    // Creditor info
    creditorName                       : String(100);
    creditorAccount                    : String(50);
    creditorBank                       : String(50);
    creditorCountry                    : String(5);
    creditorEmail                      : String(100);
    creditorMobile                     : String(50);

    // Tax info
    taxId                              : String(50);
    taxRef                             : String(50);
    taxDate                            : Date;
    taxType                            : String(20);
    taxAmount                          : Decimal(18,2);
    adjustmentReason                    : String(50);
    adjustmentType                      : String(10);

    // Remittance / Invoice info
    invoiceNumber                       : String(50);
    invoiceReference                    : String(50);
    remittanceInfo                      : String(200);
    duePayableAmount                     : Decimal(18,2);
    remittedAmount                       : Decimal(18,2);
    taxAmountRef                         : Decimal(18,2);
}