export type EmploymentType = "full-time" | "part-time" | "contractor" | "temporary";
export type EmployeeStatus = "active" | "on-leave" | "inactive";

export interface Employee {
  id: string;
  fullName: string;
  avatarUrl?: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  managerId?: string;
  managerName?: string;
  office: string;
  country: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string;
  skills: string[];
}

export interface Department {
  id: string;
  name: string;
  headName: string;
  employeeCount: number;
}

export interface KpiDatum {
  id: string;
  label: string;
  value: string;
  deltaLabel?: string;
  deltaDirection?: "up" | "down" | "flat";
}

export interface ApprovalItem {
  id: string;
  type: "leave" | "payroll-exception";
  title: string;
  requester: string;
  ageLabel: string;
}

export interface UpcomingEvent {
  id: string;
  kind: "birthday" | "anniversary" | "contract-expiry" | "start-date";
  title: string;
  dateLabel: string;
}

export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  entityLabel: string;
  timestampLabel: string;
}
