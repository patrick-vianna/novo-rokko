"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { getSubdomainConfig, SUBDOMAINS, type SubdomainConfig } from "@/lib/subdomains";

export function useSubdomain(): SubdomainConfig {
  const searchParams = useSearchParams();

  return useMemo(() => {
    if (typeof window === "undefined") return SUBDOMAINS.hub;

    const hostname = window.location.hostname;

    // Production: detect from hostname
    if (hostname.includes("rokko.rustontools.tech")) {
      const parts = hostname.split(".");
      if (parts.length >= 4) return getSubdomainConfig(parts[0]);
      return SUBDOMAINS.hub;
    }

    // Dev: use query param
    const param = searchParams.get("subdomain") || "";
    return getSubdomainConfig(param);
  }, [searchParams]);
}
