import { UserRole } from '@/enums/userRole';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: {
    id: string;
    name: string;
  };
  organizationId?: string;
  isActive: boolean;
}
