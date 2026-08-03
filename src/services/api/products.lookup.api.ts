// Project path: src/services/api/products.lookup.api.ts
//
// UNCONFIRMED for this module — see purchase-orders-ux-spec.md §1.3. Assumed
// so the line-item Product selector has something to query. Verify against
// the real backend before merging; if it differs, only this file and
// ProductLookupResponse (purchaseOrders.types.ts) need to change.

import { apiClient } from "./axiosClient";
import type { ProductLookupResponse } from "../../types/purchaseOrders.types";

export async function getProductsLookup(): Promise<ProductLookupResponse[]> {
  const { data } = await apiClient.get<ProductLookupResponse[]>("/Products");
  return data;
}
