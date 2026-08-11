// Intended path: src/hooks/useCustomers.ts
// NEW FILE — wraps customers.api.ts (full CustomerResponse) in TanStack
// Query. Distinct from any existing customer *lookup* hook used by Sales
// Orders' line-item picker (that one returns a lighter {id,name}[] shape
// and should stay as-is) — this hook is for anything needing
// isActive/contact fields, starting with the Sales Overview.

import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../services/api/customers.api';

export const CUSTOMERS_QUERY_KEY = ['customers'] as const;

export function useCustomers() {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEY,
    queryFn: customersApi.list,
  });
}
