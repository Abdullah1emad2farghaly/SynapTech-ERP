import type {
  ActivityEntry,
  ApprovalItem,
  Department,
  Employee,
  KpiDatum,
  UpcomingEvent,
} from "@/types/hr.types";

// Static, in-memory demo data. Swap for real fetches in services/api/hrApi.ts
// once the backend exists — pages consume this shape either way.
export const mockDepartments: Department[] = [
  { id: "d1", name: "Engineering", headName: "Nadia Farouk", employeeCount: 48 },
  { id: "d2", name: "Sales", headName: "Omar Said", employeeCount: 22 },
  { id: "d3", name: "People & Culture", headName: "Layla Hassan", employeeCount: 9 },
  { id: "d4", name: "Finance", headName: "Karim Adel", employeeCount: 12 },
];

export const mockEmployees: Employee[] = [
  {
    id: "e1",
    fullName: "Nadia Farouk",
    email: "nadia.farouk@synaptech.com",
    phone: "+20 100 111 2222",
    jobTitle: "VP Engineering",
    department: "Engineering",
    office: "Cairo HQ",
    country: "Egypt",
    employmentType: "full-time",
    status: "active",
    hireDate: "2019-03-01",
    skills: ["Leadership", "System Design"],
  },
  {
    id: "e2",
    fullName: "Youssef Khalil",
    email: "youssef.khalil@synaptech.com",
    phone: "+20 100 222 3333",
    jobTitle: "Senior Frontend Engineer",
    department: "Engineering",
    managerId: "e1",
    managerName: "Nadia Farouk",
    office: "Cairo HQ",
    country: "Egypt",
    employmentType: "full-time",
    status: "active",
    hireDate: "2021-06-14",
    skills: ["React", "TypeScript"],
  },
  {
    id: "e3",
    fullName: "Mona Reda",
    email: "mona.reda@synaptech.com",
    phone: "+20 100 333 4444",
    jobTitle: "Account Executive",
    department: "Sales",
    office: "Dubai",
    country: "UAE",
    employmentType: "full-time",
    status: "on-leave",
    hireDate: "2022-01-10",
    skills: ["Negotiation", "CRM"],
  },
  {
    id: "e4",
    fullName: "Karim Adel",
    email: "karim.adel@synaptech.com",
    phone: "+20 100 444 5555",
    jobTitle: "Finance Director",
    department: "Finance",
    office: "Cairo HQ",
    country: "Egypt",
    employmentType: "full-time",
    status: "active",
    hireDate: "2018-09-01",
    skills: ["FP&A", "Payroll Compliance"],
  },
  {
    id: "e5",
    fullName: "Sara Ibrahim",
    email: "sara.ibrahim@synaptech.com",
    phone: "+20 100 555 6666",
    jobTitle: "Product Designer (Contract)",
    department: "Engineering",
    managerId: "e1",
    managerName: "Nadia Farouk",
    office: "Remote",
    country: "Egypt",
    employmentType: "contractor",
    status: "active",
    hireDate: "2023-11-20",
    skills: ["Figma", "Design Systems"],
  },
];

export const mockDashboardKpis: KpiDatum[] = [
  { id: "headcount", label: "Headcount", value: "91", deltaLabel: "+4 this month", deltaDirection: "up" },
  { id: "attrition", label: "Attrition rate (12mo)", value: "6.2%", deltaLabel: "-0.8pt", deltaDirection: "down" },
  { id: "openRoles", label: "Open positions", value: "7", deltaLabel: "+2", deltaDirection: "up" },
  { id: "tenure", label: "Avg. tenure", value: "2.6 yrs", deltaLabel: "flat", deltaDirection: "flat" },
  { id: "payrollCost", label: "Payroll cost (MTD)", value: "$412K", deltaLabel: "on budget", deltaDirection: "flat" },
];

export const mockApprovals: ApprovalItem[] = [
  { id: "a1", type: "leave", title: "Annual leave · 5 days", requester: "Mona Reda", ageLabel: "2 days ago" },
  { id: "a2", type: "leave", title: "Sick leave · 1 day", requester: "Youssef Khalil", ageLabel: "6 hours ago" },
  { id: "a3", type: "payroll-exception", title: "Overtime variance flagged", requester: "Payroll system", ageLabel: "1 day ago" },
];

export const mockUpcomingEvents: UpcomingEvent[] = [
  { id: "u1", kind: "birthday", title: "Sara Ibrahim's birthday", dateLabel: "Jul 24" },
  { id: "u2", kind: "anniversary", title: "Youssef Khalil — 3 year anniversary", dateLabel: "Jul 28" },
  { id: "u3", kind: "contract-expiry", title: "Sara Ibrahim's contract expires", dateLabel: "Aug 2" },
];

export const mockActivity: ActivityEntry[] = [
  { id: "act1", actor: "Layla Hassan", action: "approved leave for", entityLabel: "Youssef Khalil", timestampLabel: "10 min ago" },
  { id: "act2", actor: "System", action: "processed payroll for", entityLabel: "July 2026", timestampLabel: "3 hours ago" },
  { id: "act3", actor: "Karim Adel", action: "updated compensation for", entityLabel: "Mona Reda", timestampLabel: "yesterday" },
];
