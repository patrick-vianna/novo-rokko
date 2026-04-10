"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { getSubdomainConfig, SUBDOMAINS, type SubdomainConfig } from "@/lib/subdomains";

export function useSubdomain(): SubdomainConfig {
  // useSearchParams may return null during SSR or outside Suspense
  let subdomainParam = "";
  try {
    const searchParams = useSearchParams();
    subdomainParam = searchParams?.get("subdomain") || "";
  } catch {
    // Fallback if outside Suspense boundary
  }

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
    return getSubdomainConfig(subdomainParam);
  }, [subdomainParam]);
}
