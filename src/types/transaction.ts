import { TransactionType } from '@/enums/transactionType';
import { TransactionStatus } from '@/enums/transactionStatus';

export interface Transaction {
  id: string;
  date: string; // ISO date string
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  accountId: string;
  isActive: boolean;
}
