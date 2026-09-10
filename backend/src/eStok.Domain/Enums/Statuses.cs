namespace eStok.Domain.Enums;
public enum InventoryMovementType { InitialStock, Purchase, Sale, Return, AdjustmentIn, AdjustmentOut, TransferIn, TransferOut, Damage }
public enum SaleStatus { Draft, Pending, Completed, Cancelled, Refunded, PartiallyRefunded }
public enum PaymentStatus { Pending, Partial, Paid, Overdue, Cancelled }
public enum QuoteStatus { Draft, Sent, Accepted, Rejected, Expired, Converted }
public enum ReceivableStatus { Pending, Partial, Paid, Overdue, Cancelled }
public enum PaymentMethodType { Cash, Card, BankTransfer, Credit, Other }
public enum DocumentType { Sale, Quote, Purchase }
