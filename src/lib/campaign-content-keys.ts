const campaignContentKeyOverrides: Record<string, string> = {
  "campaign.hero.badge": "campaign.badge",
  "campaign.hero.heading": "campaign.heading",
  "campaign.hero.description": "campaign.description",
  "campaign.hero.primaryCta": "campaign.heroPrimaryCta",
  "campaign.hero.secondaryCta": "campaign.heroSecondaryCta",

  "campaign.overview.title": "campaign.overview.title",
  "campaign.overview.description": "campaign.overview.description",

  "campaign.funding.title": "campaign.funding.title",
  "campaign.funding.description": "campaign.funding.description",

  "campaign.eligibility.title": "campaign.eligibility.title",
  "campaign.eligibility.description": "campaign.eligibility.description",

  "campaign.projects.title": "campaign.projects.title",
  "campaign.projects.description": "campaign.projects.description",

  "campaign.services.title": "campaign.services.title",
  "campaign.services.description": "campaign.services.description",

  "campaign.technologies.title": "campaign.technologies.title",
  "campaign.technologies.description": "campaign.technologies.description",

  "campaign.criteria.title": "campaign.criteria.title",
  "campaign.criteria.description": "campaign.criteria.description",

  "campaign.cultural.title": "campaign.cultural.title",
  "campaign.cultural.description": "campaign.cultural.description",

  "campaign.selection.title": "campaign.selection.title",
  "campaign.selection.description": "campaign.selection.description",

  "campaign.timeline.title": "campaign.timeline.title",
  "campaign.timeline.description": "campaign.timeline.description",

  "campaign.delivery.title": "campaign.delivery.title",
  "campaign.delivery.description": "campaign.delivery.description",

  "campaign.responsibilities.title": "campaign.responsibilities.title",
  "campaign.responsibilities.description": "campaign.responsibilities.description",

  "campaign.support.title": "campaign.support.title",
  "campaign.support.description": "campaign.support.description",

  "campaign.portfolio.title": "campaign.portfolio.title",
  "campaign.portfolio.description": "campaign.portfolio.description",

  "campaign.branding.title": "campaign.branding.title",
  "campaign.branding.description": "campaign.branding.description",

  "campaign.futureChanges.title": "campaign.futureChanges.title",
  "campaign.futureChanges.description": "campaign.futureChanges.description",

  "campaign.restrictions.title": "campaign.restrictions.title",
  "campaign.restrictions.description": "campaign.restrictions.description",

  "campaign.faq.title": "campaign.faq.title",
  "campaign.faq.description": "campaign.faq.description",

  "campaign.cta.title": "campaign.cta.title",
  "campaign.cta.description": "campaign.cta.description",
  "campaign.cta.button": "campaign.ctaButton",
  "campaign.cta.secondaryButton": "campaign.ctaSecondaryButton",

  "campaign.apply.title": "campaign.apply.title",
  "campaign.apply.description": "campaign.apply.description",
};

export function getCampaignContentDictionaryKey(pageSlug: string, sectionKey: string, key: string): string {
  const compound = `campaign.${sectionKey}.${key}`;
  return campaignContentKeyOverrides[compound] || compound;
}
