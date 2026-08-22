// src/components/common/AuthGuard.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { getFirstAllowedRoute } from "@/utils/permissions";
import { getCurrentUser } from "@/App";
import { useNavItems } from "@/constants/navigation";
import { getUserPermissions } from "@/pages/common/LoginPage";

function getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
}

export function ProtectedRoute() {
    const location = useLocation();
    const token = getAccessToken();

    if (!token) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}

export function PublicOnlyRoute() {
    const token = getAccessToken();
    const isAdmin = getCurrentUser();
    const navItems = useNavItems();
    const userPermissions = getUserPermissions();
    const route = getFirstAllowedRoute(navItems, isAdmin, userPermissions)

    if (token) {
        return (
            <Navigate
                to={route ? route : "/sales" }
                replace
            />
        );
    }

    return <Outlet />;
}