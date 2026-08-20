// Project path: src/types/suppliers.types.ts

/** Matches confirmed GET /api/Suppliers and GET /api/Suppliers/{id} */
export interface SupplierResponse {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  isActive: boolean;
}

/** Body for POST /api/Suppliers */
export interface CreateSupplierPayload {
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxNumber: string | null;
}

/** Body for PUT /api/Suppliers/{id} */
export interface UpdateSupplierPayload {
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxNumber: string | null;
  isActive: boolean;
}
