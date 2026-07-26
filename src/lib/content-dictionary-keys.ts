const contentKeyOverrides: Record<string, string> = {
  "home.hero.eyebrow": "hero.eyebrow",
  "home.hero.heading": "hero.heading",
  "home.hero.description": "hero.description",
  "home.hero.primaryCta": "hero.primaryCta",
  "home.hero.secondaryCta": "hero.secondaryCta",
  "home.featured.sectionTitle": "home.projectsHeading",
  "home.featured.sectionDescription": "home.projectsDescription",
  "home.cta.heading": "home.ctaHeading",
  "home.cta.description": "home.ctaDescription",
  "home.cta.buttonLabel": "home.ctaButton",
  "home.cta.learnMoreLabel": "home.ctaLearnMore",

  "about.hero.badge": "about.badge",
  "about.hero.heading": "about.heading",
  "about.hero.description": "about.description",

  "services.hero.badge": "services.badge",
  "services.hero.heading": "services.heading",
  "services.hero.description": "services.description",

  "portfolio.hero.badge": "portfolio.badge",
  "portfolio.hero.heading": "portfolio.heading",
  "portfolio.hero.description": "portfolio.description",

  "team.hero.badge": "team.badge",
  "team.hero.heading": "team.heading",
  "team.hero.description": "team.description",

  "contact.hero.badge": "contact.badge",
  "contact.hero.heading": "contact.heading",
  "contact.hero.description": "contact.description",

};

export function getContentDictionaryKey(page: string, section: string, key: string): string {
  const compound = `${page}.${section}.${key}`;
  return contentKeyOverrides[compound] || compound;
}

export function getContentKeyOverrides(): Record<string, string> {
  return { ...contentKeyOverrides };
}
