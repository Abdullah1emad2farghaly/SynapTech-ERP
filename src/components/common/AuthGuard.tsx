// src/components/common/AuthGuard.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

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

    if (token) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return <Outlet />;
}