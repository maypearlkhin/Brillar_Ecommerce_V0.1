import { createCustomerTools } from './customer';
import { createPublicTools } from './public';

export function createAllTools(userToken?: string) {
  return [...createPublicTools(), ...createCustomerTools(userToken)];
}
