import { NavLink, Stat } from "@/types";

export const siteConfig = {
  name: "BTA LAB",
  tagline: "We help small businesses grow.",
  description:
    "BTA LAB is a digital innovation lab where students collaborate to build real-world digital products, websites, branding, marketing campaigns, and software solutions — bridging the gap between education and industry.",
  phone: "+1 (555) 123-4567",
  address: "123 Innovation Drive, Tech City, TC 10001",
  location: "Tbilisi, Georgia",
  socials: {
    facebook: "https://facebook.com/bta-lab",
    instagram: "https://instagram.com/bta_lab",
  },
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];

export const stats: Stat[] = [
  { label: "Team Members", value: 0, translationKey: "teamMembers" },
  { label: "Completed Projects", value: 48, suffix: "+", translationKey: "completedProjects" },
  { label: "Services", value: 0, translationKey: "services" },
  { label: "Technologies", value: 20, suffix: "+", translationKey: "technologies" },
];
