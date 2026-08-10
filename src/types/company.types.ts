// Intended path: src/types/company.types.ts
//
// Source of truth: GET/PUT /api/Companies/me only.
// Do not add fields (logo, email, phone, address, etc.) — none exist on this API.

export interface CompanyResponse {
  id: string; // UUID, read-only
  name: string | null;
  legalName: string | null;
  taxNumber: string | null;
  currency: string | null;
  country: string | null;
  isActive: boolean;
}

export interface UpdateCompanyRequest {
  name: string | null;
  legalName: string | null;
  taxNumber: string | null;
  currency: string | null;
  country: string | null;
  isActive: boolean;
}
