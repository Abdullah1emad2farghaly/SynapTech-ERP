// src/services/api/employees.lookup.api.ts

import type { EmployeeResponse } from "@/types/employee.types";
import { apiClient } from "./axiosClient";

export interface EmployeeManagerOption {
    value: string;
    label: string;
}

/**
 * Fetch employees that can be used as manager options.
 */
export async function getEmployeeManagerOptions(
    excludeEmployeeId?: string
): Promise<EmployeeManagerOption[]> {
    const response = await apiClient.get<EmployeeResponse[]>("/Employees");

    return response.data
        .filter((employee) => employee.id !== excludeEmployeeId)
        .map((employee) => ({
            value: employee.id,
            label:
                employee.fullName?.trim() ||
                employee.employeeCode ||
                employee.id,
        }));
}