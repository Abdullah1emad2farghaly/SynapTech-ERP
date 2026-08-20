// src/services/api/customers.crud.api.ts
//
// Scoped strictly to the confirmed backend surface:
//   GET    /api/Customers
//   POST   /api/Customers        { name, contactName, phone, email, address, taxNumber }
//   GET    /api/Customers/{id}
//   PUT    /api/Customers/{id}   { ...same + isActive }
//   DELETE /api/Customers/{id}
//
// No naming-collision risk — no earlier module built a lookup-only
// Customers service (nothing else in this project references a
// customerId), so this is the only Customers service file needed.

import { apiClient } from "./axiosClient";

export interface Customer {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  isActive: boolean;
}

export interface CreateCustomerPayload {
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxNumber: string | null;
}

export interface UpdateCustomerPayload {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxNumber: string | null;
  isActive: boolean;
}

export async function getAllCustomers(): Promise<Customer[]> {
  const { data } = await apiClient.get<Customer[]>("/Customers");
  return data;
}

export async function getCustomerById(id: string): Promise<Customer> {
  const { data } = await apiClient.get<Customer>(`/Customers/${id}`);
  return data;
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  console.log(payload)
  const { data } = await apiClient.post<Customer>("/Customers", payload);
  return data;
}

export async function updateCustomer(payload: UpdateCustomerPayload): Promise<Customer> {
  const { id, ...body } = payload;
  const { data } = await apiClient.put<Customer>(`/Customers/${id}`, body);
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/Customers/${id}`);
}
