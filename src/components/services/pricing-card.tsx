"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { scrollToPageTop } from "@/lib/public-scroll";
import { formatPrice } from "@/lib/format-price";
import type { PricingPackage } from "@/types";
import { ServiceCard } from "@/components/services/service-card";
import {
  Rocket,
  Globe,
  Star,
  ShoppingCart,
  Zap,
  Wrench,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Rocket: <Rocket size={20} />,
  Globe: <Globe size={20} />,
  Star: <Star size={20} />,
  ShoppingCart: <ShoppingCart size={20} />,
  Zap: <Zap size={20} />,
  Wrench: <Wrench size={20} />,
};

interface PricingCardProps {
  pkg: PricingPackage;
  index?: number;
  onPlanProject?: (pkgId: string, pkgName: string, pkgPrice: string, isCustomPrice: boolean) => void;
  maxVisibleFeatures?: number;
  onExpandedChange?: (pkgId: string, expanded: boolean) => void;
}

export function PricingCard({
  pkg,
  index = 0,
  onPlanProject,
  maxVisibleFeatures,
  onExpandedChange,
}: PricingCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const isCollapsed = maxVisibleFeatures !== undefined && !expanded;
  const hasManyFeatures = maxVisibleFeatures !== undefined && pkg.features.length > maxVisibleFeatures;
  const visibleFeatures = isCollapsed
    ? pkg.features.slice(0, maxVisibleFeatures)
    : pkg.features;

  const featureListId = `features-${pkg.id}`;

  const handleCta = () => {
    if (onPlanProject) {
      onPlanProject(pkg.id, pkg.name, String(pkg.price), !!pkg.customPrice);
    } else {
      scrollToPageTop();
      router.push(`/contact?package=${pkg.id}`, { scroll: false });
    }
  };

  const handleToggleExpand = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    onExpandedChange?.(pkg.id, nextExpanded);
  };

  return (
    <ServiceCard
      index={index}
      icon={pkg.iconName && iconMap[pkg.iconName] ? iconMap[pkg.iconName] : undefined}
      title={pkg.name}
      price={formatPrice(pkg.price, pkg.priceSuffix)}
      billingLabel={pkg.billingLabel}
      features={visibleFeatures}
      featureTooltips={pkg.featureTooltips}
      featureListId={featureListId}
      deliveryTime={pkg.deliveryTime}
      showExpandToggle={hasManyFeatures}
      expanded={expanded}
      onToggleExpand={handleToggleExpand}
      cta={pkg.cta}
      onSelect={handleCta}
    />
  );
}
