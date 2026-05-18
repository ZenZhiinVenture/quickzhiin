import { AccountType } from '@/enums/accountType';

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  isActive: boolean;
}
