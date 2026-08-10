// import { useEmployees } from "@/hooks/useEmployees";
// import { useMemo } from "react";

// // CreateEmployeePage.tsx / EditEmployeePage.tsx
// const { data: employees = [] } = useEmployees();
// export const managerOptions = useMemo(
//   () =>
//     employees
//       .filter((e) => e.id !== id) // self-exclusion, edit mode only
//       .map((e) => ({
//         value: e.id,
//         label: e.fullName?.trim() || e.employeeCode || e.id,
//       })),
//   [employees, id]
// );
