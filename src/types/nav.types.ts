// Intended path: src/types/nav.types.ts

import type { LucideIcon } from "lucide-react";

export interface NavChild {
  id: string;
  label: string;
  /** Route this child navigates to. */
  to: string;
  icon?: LucideIcon;
  /**
   * Permissions that grant access to this child. Undefined or an empty
   * array means "public" — always accessible to any authenticated user.
   * ANY one matching permission is enough (OR semantics).
   */
  permissions?: string[];
}

export interface NavItem {
  id: string;
  label: string;
  /**
   * Route for items with no children (e.g. Dashboard). For items WITH
   * children, this is only a static fallback — at render time it gets
   * overwritten by filterNavByPermissions() with the first accessible
   * child's `to`, so non-admin users never land on a route they can't see.
   */
  to?: string;
  icon?: LucideIcon;
  children?: NavChild[];
  /**
   * Only consulted for parent-less items (no children). Same semantics
   * as NavChild.permissions. Lets a leaf top-level item (not just
   * category children) be permission-gated too, without forcing every
   * leaf to be wrapped in a fake single-child category.
   */
  permissions?: string[];
}
