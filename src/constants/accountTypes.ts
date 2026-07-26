// src/constants/accountTypes.ts
//
// The confirmed set of account types. Earlier, accountType was treated as
// a free-form string with no documented enum, so AccountDrawer used a
// free-text input + datalist and AccountsKpiRow derived its per-type
// cards from whatever values happened to be in the loaded data. Now that
// the actual set is known, both should use this fixed list instead —
// AccountDrawer becomes a closed select (no more inventing new types
// through the UI), and the KPI row can show a stable card per type even
// before any account of that type exists yet (count: 0), rather than
// only showing types that already have at least one account.
//
// Kept as a single exported constant so there's one place to update if
// this list ever changes, rather than it being duplicated across the
// drawer and the list page.

export const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"] as const;

export type AccountTypeValue = (typeof ACCOUNT_TYPES)[number];
