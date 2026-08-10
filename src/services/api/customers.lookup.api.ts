// Project path: src/services/api/customers.lookup.api.ts
//
// UNCONFIRMED — no Customers lookup endpoint is confirmed anywhere in this
// project's API set (see sales-orders-ux-spec.md §1). Assumed so the
// Customer selector has something to query. Verify before merging; if it
// differs, only this file and CustomerLookupResponse (salesOrders.types.ts)
// need to change.

import { apiClient } from "./axiosClient";
import type { CustomerLookupResponse } from "../../types/salesOrders.types";

export async function getCustomersLookup(): Promise<CustomerLookupResponse[]> {
  const { data } = await apiClient.get<CustomerLookupResponse[]>("/Customers");
  return data;
}
