// Project path: src/types/warehouses.types.ts

/** Matches confirmed GET /api/Warehouses and GET /api/Warehouses/{id} */
export interface WarehouseResponse {
  id: string;
  name: string;
  code: string;
  branchId: string;
  isActive: boolean;
}

/** Body for POST /api/Warehouses */
export interface CreateWarehousePayload {
  name: string;
  code: string;
  branchId: string;
}

/** Body for PUT /api/Warehouses/{id} */
export interface UpdateWarehousePayload {
  name: string;
  code: string;
  branchId: string;
  isActive: boolean;
}
