namespace webhook.payments;

entity PaymentFiles {
  key ID                  : UUID;
      fileIdentifier      : String(50);
      numberOfTransactions: Integer;
      consentId           : String(20);
      controlSum          : Decimal(15,2);
      secondaryIdentification : String(20);
      yesBankPayload      : LargeString;
      createdAt           : Timestamp;
}