"use client";

import { useTranslation } from "@/lib/use-dictionary";
import { formatPrice } from "@/lib/format-price";
import type { ServiceAddon } from "@/types";
import { ServiceCard } from "@/components/services/service-card";
import {
  Search,
  MapPin,
  BarChart3,
  Mail,
  Globe,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Search: <Search size={20} />,
  MapPin: <MapPin size={20} />,
  BarChart3: <BarChart3 size={20} />,
  Mail: <Mail size={20} />,
  Globe: <Globe size={20} />,
};

interface ServiceAddonCardProps {
  addon: ServiceAddon;
  index?: number;
  onSelect?: (addonId: string, addonName: string, addonPrice: string, isCustomPrice: boolean) => void;
}

export function ServiceAddonCard({
  addon,
  index = 0,
  onSelect,
}: ServiceAddonCardProps) {
  const { t } = useTranslation();

  const handleCta = () => {
    if (onSelect) {
      onSelect(addon.id, addon.name, String(addon.price), false);
    }
  };

  return (
    <ServiceCard
      index={index}
      icon={addon.iconName && iconMap[addon.iconName] ? iconMap[addon.iconName] : undefined}
      title={addon.name}
      price={formatPrice(addon.price, addon.priceSuffix)}
      description={addon.description || undefined}
      cta={t("pricing.choosePackage")}
      onSelect={handleCta}
    />
  );
}
