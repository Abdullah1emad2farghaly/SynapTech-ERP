import type { LucideIcon } from "lucide-react";

export interface NavChild {
  id: string;
  label: string;
  to: string;
}

export interface NavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  children?: NavChild[];
}
