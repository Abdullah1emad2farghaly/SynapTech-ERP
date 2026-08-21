// Intended path: src/hooks/usePermissions.ts
//
// Same fetch you had inline in Sidebar.tsx (getMyPermissions() +
// mounted-guarded useState), pulled out so both the sidebar and the
// route guard read from one place instead of firing two independent
// requests that could resolve at different times.

import { useEffect, useState } from "react";
import { getMyPermissions } from "@/services/api/roles.crud.api";

export interface UsePermissionsResult {
  permissions: string[];
  isLoading: boolean;
}

export function usePermissions(): UsePermissionsResult {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadPermissions = async () => {
      try {
        setIsLoading(true);

        const result = await getMyPermissions();

        if (!mounted) return;

        setPermissions(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Failed to load user permissions:", error);

        if (mounted) {
          setPermissions([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  return { permissions, isLoading };
}
