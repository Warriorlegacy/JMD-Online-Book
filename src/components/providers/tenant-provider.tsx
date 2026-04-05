"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Tenant, TenantTheme } from "@/types/database";

interface TenantContextType {
  tenant: Tenant | null;
  theme: TenantTheme;
  isLoading: boolean;
  tenantId: string | null;
}

const defaultTheme: TenantTheme = {
  primary: "#f59e0b",
  secondary: "#1e293b",
  appName: "JMD Online Book",
};

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  theme: defaultTheme,
  isLoading: true,
  tenantId: null,
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [theme, setTheme] = useState<TenantTheme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTenant() {
      try {
        const response = await fetch("/api/tenant/current");
        if (response.ok) {
          const data = await response.json();
          if (data.tenant) {
            setTenant(data.tenant);
            setTenantId(data.tenant.id);
            const config = data.tenant.theme_config as TenantTheme ?? {};
            setTheme({
              primary: data.tenant.primary_color ?? "#f59e0b",
              secondary: data.tenant.secondary_color ?? "#1e293b",
              logo: data.tenant.logo_url ?? undefined,
              appName: config.appName ?? data.tenant.name ?? "JMD Online Book",
              ...config,
            });
          }
        }
      } catch {
        // Error loading tenant
      } finally {
        setIsLoading(false);
      }
    }
    fetchTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, theme, isLoading, tenantId }}>
      <div
        style={{
          "--color-primary": theme.primary ?? "#f59e0b",
          "--color-secondary": theme.secondary ?? "#1e293b",
        } as React.CSSProperties}
      >
        {children}
      </div>
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}

export function useTheme() {
  const { theme } = useTenant();
  return theme;
}