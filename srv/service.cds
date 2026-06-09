using webhook.payments as db from '../db/schema';

service PaymentService {

  entity PaymentFiles as projection on db.PaymentFiles;

  action uploadXML(fileName: String, xmlContent: LargeString) returns LargeString;
   action generatePayload(fileIdentifier: String, Data: LargeString) returns LargeString;
  
}