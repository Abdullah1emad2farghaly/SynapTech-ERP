// src/services/api/company.api.ts
import { apiClient } from './axiosClient'; // ASSUMPTION: client.ts export shape unverified — see handoff Section 10/12
import type { Company, UpdateCompanyPayload } from '../../types/company.types';

const BASE_URL = '/Companies/me';

export const getCompany = async (): Promise<Company> => {
  const { data } = await apiClient.get<Company>(BASE_URL);
  return data;
};

export const updateCompany = async (
  payload: UpdateCompanyPayload
): Promise<Company> => {
  const { data } = await apiClient.put<Company>(BASE_URL, payload);
  return data;
};
