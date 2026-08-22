import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/admin/auth/AuthLayout";
import { AuthContainer } from "@/components/admin/auth/AuthContainer";
import { LoginForm } from "@/components/admin/auth/LoginForm";
import { getFirstAllowedRoute } from "@/utils/permissions";
import { useNavItems } from "@/constants/navigation";
import { getMyPermissions } from "@/services/api/roles.crud.api";
import { Seo } from "@/components/common/Seo";
import { StructuredData } from "@/components/common/StructuredData";

// src/utils/permissions.ts

export function getUserPermissions(): string[] {
  const storedPermissions = localStorage.getItem("userPermissions");
  if (!storedPermissions) {
    return [];
  }

  try {
    const permissions = JSON.parse(storedPermissions);
    return Array.isArray(permissions) ? permissions : [];
  } catch (error) {
    console.error("Failed to parse user permissions:", error);
    return [];
  }
}

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navItems = useNavItems();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://synaptech-erp.vercel.app/#organization",
        name: "SynapTech ERP",
        url: "https://synaptech-erp.vercel.app/",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://synaptech-erp.vercel.app/#software",
        name: "SynapTech ERP",
        applicationCategory: "BusinessApplication",
        applicationSubCategory:
          "Enterprise Resource Planning",
        operatingSystem: "Web",
        description:
          "SynapTech ERP is a modern enterprise resource planning system for managing accounting, inventory, purchasing, sales, human resources, and business operations.",
        url: "https://synaptech-erp.vercel.app/",
        image:
          "https://synaptech-erp.vercel.app/og-image.jpg",
        brand: {
          "@id":
            "https://synaptech-erp.vercel.app/#organization",
        },
      },
    ],
  };

  return (
    <>
      <Seo
        title="Login | SynapTech ERP"
        description="Sign in to SynapTech ERP to manage your business operations, accounting, inventory, sales, purchasing, and human resources."
        robots="index, follow"
      />

      <StructuredData data={structuredData} />

      <AuthLayout>
        <AuthContainer
          heading={t("auth.login.heading")}
          subtitle={t("auth.login.subtitle")}
        >
          <LoginForm
            onSuccess={async () => {
              // ASSUMPTION: by the time this callback runs, useLogin()'s own
              // mutation onSuccess (inside hooks/useAuth.ts) has already
              // written the token + user to localStorage under
              // "currentUser" — this onSuccess is the one passed to
              // login.mutate(), which React Query calls AFTER the hook's
              // own onSuccess. If useAuth.ts doesn't persist the user
              // before calling this, role will read as empty below and
              // isAdmin will always be false. Worth a quick check.
              const rawUser = window.localStorage.getItem("currentUser");
              let role = "";
              try {
                role = rawUser ? JSON.parse(rawUser)?.role ?? "" : "";
              } catch {
                role = "";
              }
              const isAdmin = role.toLowerCase() === "admin";

              let permissions: string[] = [];
              try {
                const result = await getMyPermissions();
                window.localStorage.setItem('userPermissions', JSON.stringify(result));
                permissions = Array.isArray(result) ? result : [];
              } catch (error) {
                console.error("Failed to load permissions after login:", error);
              }

              const destination = getFirstAllowedRoute(
                navItems,
                isAdmin,
                permissions
              );

              // No accessible routes at all (a real possibility for a
              // brand-new role with nothing assigned yet) — falling back to
              // "/" rather than navigating nowhere. If you add a dedicated
              // "no access" page, swap this for that route instead.
              navigate(destination ?? "/", { replace: true });
            }}
          />
        </AuthContainer>
      </AuthLayout>
    </>
  );
}
