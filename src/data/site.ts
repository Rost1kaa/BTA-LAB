import { NavLink, Stat } from "@/types";

export const siteConfig = {
  name: "BTA LAB",
  tagline: "We help small businesses grow.",
  description:
    "BTA LAB is a digital innovation lab where students collaborate to build real-world digital products, websites, branding, marketing campaigns, and software solutions — bridging the gap between education and industry.",
  phone: "+995 579 009 247",
  address: "თბილისი, წერონისის 208",
  location: "Tbilisi, Tseronisi 208",
  socials: {
    facebook: "https://www.facebook.com/bta.lab.official",
    instagram: "https://www.instagram.com/bta.lab.official",
    tiktok: "https://www.tiktok.com/@bta.lab.official",
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
