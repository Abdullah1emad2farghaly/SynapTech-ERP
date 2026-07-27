// src/types/company.types.ts

export interface Company {
  id: string;
  name: string;
  legalName: string;
  taxNumber: string;
  currency: string;
  country: string;
  isActive: boolean;
}

export interface UpdateCompanyPayload {
  name: string;
  legalName: string;
  taxNumber: string;
  currency: string;
  country: string;
  isActive: boolean;
}
