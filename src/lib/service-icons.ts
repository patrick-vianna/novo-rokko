import {
  Target, BarChart3, Globe, Mail, ShoppingBag, Database, Code, Key, Camera, Share2,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  "Meta Ads": Target,
  "Google Ads": Target,
  "Instagram": Camera,
  "Facebook": Share2,
  "TikTok Ads": Target,
  "Google Analytics": BarChart3,
  "Google Tag Manager": Code,
  "WordPress": Globe,
  "Shopify": ShoppingBag,
  "RD Station": Database,
  "Kommo CRM": Database,
  "Email corporativo": Mail,
};

export const DEFAULT_SERVICE_ICON: LucideIcon = Key;

export function getServiceIcon(serviceName: string): LucideIcon {
  return SERVICE_ICONS[serviceName] || DEFAULT_SERVICE_ICON;
}

export const SERVICE_OPTIONS = [
  "Meta Ads",
  "Google Ads",
  "Instagram",
  "Facebook",
  "TikTok Ads",
  "Google Analytics",
  "Google Tag Manager",
  "WordPress",
  "Shopify",
  "RD Station",
  "Kommo CRM",
  "Email corporativo",
];

export const SERVICE_CATEGORIES = [
  { value: "ads", label: "Midia Paga" },
  { value: "social_media", label: "Redes Sociais" },
  { value: "analytics", label: "Analytics" },
  { value: "crm", label: "CRM" },
  { value: "website", label: "Site / CMS" },
  { value: "email", label: "Email" },
  { value: "other", label: "Outro" },
];
