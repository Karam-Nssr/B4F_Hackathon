import type { UserRole } from '../../users/schemas/user.schema.js';

export interface AuthenticatedUser {
  sub: string;
  role: UserRole;
}
