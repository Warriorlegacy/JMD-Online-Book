"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface TenantTheme {
  primaryColor: string;
  backgroundColor: string;
}

interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  theme: TenantTheme;
}

interface TenantContextType {
  tenant: TenantConfig | null;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType>({ tenant: null, loading: true });

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantConfig = async () => {
      try {
        const res = await fetch("/api/tenant/config");
        if (res.ok) {
          const data = await res.json();
          setTenant(data);
          
          // Apply white-labeling theme dynamically
          if (data.theme) {
            document.documentElement.style.setProperty("--primary", data.theme.primaryColor);
            document.documentElement.style.setProperty("--background", data.theme.backgroundColor);
            
            // Set dynamic page title
            document.title = `${data.name} | Premium Betting Exchange`;
          }
        }
      } catch (err) {
        console.error("Failed to load tenant configuration:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantConfig();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
