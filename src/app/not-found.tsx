"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/use-dictionary";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg-primary)]" />

      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center max-w-lg mx-auto">
          <span className="text-[120px] md:text-[160px] font-bold leading-none tracking-tight text-gradient">
            404
          </span>
          <h1 className="mt-6 text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            {t("notFound.title")}
          </h1>
          <p className="mt-3 text-base text-[var(--color-fg-tertiary)] leading-relaxed">
            {t("notFound.description")}
          </p>
          <div className="mt-8">
            <Link href="/">
              <Button variant="primary" size="lg">
                {t("notFound.button")}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
