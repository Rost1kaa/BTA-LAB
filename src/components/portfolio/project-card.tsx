"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProjectPreview } from "@/components/portfolio/project-preview";
import type { PortfolioProject } from "@/types/supabase";

function ProjectCardShell({
  project,
  categoryLabel,
  technologyLimit,
  imagePriority = false,
  children,
}: {
  project: PortfolioProject;
  categoryLabel: string;
  technologyLimit: number;
  imagePriority?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] transition-all duration-500 hover:bg-[var(--color-bg-surface-hover)] w-full h-full flex flex-col">
      <ProjectPreview
        imageSrc={project.cover_image || "/images/qey_ge.webp"}
        altText={project.alt_text || `${project.title} full website preview`}
        eager={imagePriority}
      />
      <div className="p-6 flex flex-col flex-1">
        <Badge variant="subtle" size="sm">{categoryLabel}</Badge>
        <h3 className="mt-3 text-xl font-semibold text-[var(--color-fg-primary)]">{project.title}</h3>
        <p className="mt-2 text-sm text-[var(--color-fg-tertiary)] leading-relaxed line-clamp-3 flex-1">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(project.technologies || []).slice(0, technologyLimit).map((technology) => (
            <span key={technology} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)]/70">{technology}</span>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

export function FeaturedProjectCard({
  project,
  categoryLabel,
  detailsLabel,
  imagePriority,
}: {
  project: PortfolioProject;
  categoryLabel: string;
  detailsLabel: string;
  imagePriority?: boolean;
}) {
  return (
    <div className="group h-full">
      <ProjectCardShell project={project} categoryLabel={categoryLabel} technologyLimit={3} imagePriority={imagePriority}>
        <Link href={`/portfolio/${project.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--color-fg-tertiary)]/50 group-hover:text-[var(--color-fg-tertiary)]/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30 rounded-lg">
          {detailsLabel}
          <ArrowRight size={14} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </ProjectCardShell>
    </div>
  );
}

export function PortfolioProjectCard({
  project,
  categoryLabel,
  detailsLabel,
  visitLabel,
  imagePriority,
}: {
  project: PortfolioProject;
  categoryLabel: string;
  detailsLabel: string;
  visitLabel: string;
  imagePriority?: boolean;
}) {
  return (
    <ProjectCardShell project={project} categoryLabel={categoryLabel} technologyLimit={5} imagePriority={imagePriority}>
      <div className="mt-auto pt-6 flex items-center gap-3">
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)]/80 hover:text-[var(--color-fg-primary)] transition-colors">
            {visitLabel}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
        <Link href={`/portfolio/${project.slug}`} className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-tertiary)]/80 transition-colors">
          {detailsLabel}
          <ArrowRight size={14} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </ProjectCardShell>
  );
}
