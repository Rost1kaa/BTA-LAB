import { Project } from "@/types";

export const projectCategories = [
  { label: "All", value: "all" },
  { label: "Web", value: "Web" },
  { label: "E-commerce", value: "E-commerce" },
  { label: "Branding", value: "Branding" },
  { label: "Marketing", value: "Marketing" },
  { label: "UI/UX", value: "UI/UX" },
];

export const projects: Project[] = [
  {
    id: "qey-ge",
    slug: "qey-ge",
    title: "qey.ge",
    category: "E-commerce",
    description:
      "A modern e-commerce platform with seamless checkout, real-time inventory management, and an intuitive admin dashboard.",
    fullDescription:
      "qey.ge is a comprehensive e-commerce solution built for the Georgian market. The platform features a modern, responsive design with a focus on mobile shopping, fast load times, and a frictionless checkout experience. The admin panel provides real-time analytics, inventory tracking, and order management.",
    problem:
      "The existing e-commerce landscape lacked a modern, fast, and user-friendly platform tailored to local market needs. Businesses struggled with outdated systems that offered poor mobile experiences and limited features.",
    solution:
      "We built a custom e-commerce platform from the ground up, focusing on performance, mobile-first design, and local market requirements. The platform includes advanced search, filtering, and a streamlined checkout process that reduced cart abandonment significantly.",
    results: [
      "60% faster page load times",
      "35% reduction in cart abandonment",
      "200+ merchants onboarded",
      "4.8/5 average user rating",
    ],
    technologies: ["Next.js", "Node.js", "PostgreSQL", "Redis", "Stripe", "Docker"],
    coverImage: "/images/qey_ge.webp",
    gallery: [],
    link: "https://qey.ge",
    featured: true,
  },
];
