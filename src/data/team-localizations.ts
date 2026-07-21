export interface TeamMemberKaLocalization {
  role: string;
  bio: string;
  skills: string[];
}

export const teamMemberKaLocalizations: Record<string, TeamMemberKaLocalization> = {
  "Alex Morgan": {
    role: "Full Stack დეველოპერი",
    bio: "Full stack დეველოპერი React-ის, Node.js-ისა და cloud არქიტექტურის გამოცდილებით. მუშაობს მასშტაბირებადი ვებ აპლიკაციების შექმნასა და დამწყები დეველოპერების მენტორობაზე.",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker"],
  },
  "Sarah Chen": {
    role: "Frontend დეველოპერი",
    bio: "Frontend სპეციალისტი დიზაინისა და წარმადობის ძლიერი ხედვით. ქმნის გლუვ, ადაპტირებულ ინტერფეისებს თანამედროვე framework-ებისა და ანიმაციის ბიბლიოთეკების გამოყენებით.",
    skills: ["Next.js", "Tailwind CSS", "Framer Motion", "TypeScript", "Figma"],
  },
  "Marcus Johnson": {
    role: "Backend დეველოპერი",
    bio: "Backend ინჟინერი API დიზაინის, მონაცემთა ბაზების ოპტიმიზაციისა და serverless არქიტექტურის მიმართულებით. ზრუნავს, რომ აპლიკაციები ეფექტურად მუშაობდეს მასშტაბზე.",
    skills: ["Python", "Django", "PostgreSQL", "Redis", "GraphQL", "Docker"],
  },
  "Emily Rodriguez": {
    role: "UI/UX დიზაინერი",
    bio: "დიზაინერი, რომელიც ქმნის ინტუიციურ, მომხმარებელზე ორიენტირებულ ინტერფეისებს. აერთიანებს კვლევაზე დაფუძნებულ დიზაინს და ძლიერ ვიზუალურ შესრულებას.",
    skills: ["Figma", "მომხმარებლის კვლევა", "პროტოტიპირება", "დიზაინ სისტემა", "გამოყენებადობის ტესტირება"],
  },
  "Jordan Lee": {
    role: "გრაფიკული დიზაინერი",
    bio: "კრეატიული დიზაინერი ბრენდის იდენტობის, ვიზუალური კომუნიკაციისა და ბეჭდური დიზაინის მიმართულებით. რთულ იდეებს მკაფიო და დასამახსოვრებელ ვიზუალებად აქცევს.",
    skills: ["Illustrator", "Photoshop", "After Effects", "ბრენდის იდენტობა", "ტიპოგრაფია"],
  },
  "Taylor Kim": {
    role: "ვიდეო რედაქტორი",
    bio: "ვიდეო წარმოების სპეციალისტი storytelling-ის, motion graphics-ისა და პოსტპროდაქშენის გამოცდილებით. ქმნის ბრენდებისა და კამპანიებისთვის ძლიერ ვიზუალურ ისტორიებს.",
    skills: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Motion Graphics", "Color Grading"],
  },
  "Priya Patel": {
    role: "ციფრული მარკეტერი",
    bio: "მონაცემებზე დაფუძნებული მარკეტერი ზრდის სტრატეგიების, SEO-სა და კონვერსიის ოპტიმიზაციის მიმართულებით. ეხმარება ბიზნესებს სწორ აუდიტორიასთან მისვლასა და გაზომვადი შედეგების მიღებაში.",
    skills: ["SEO", "Google Analytics", "კონტენტ სტრატეგია", "PPC", "ელფოსტის მარკეტინგი"],
  },
  "Dylan Okonkwo": {
    role: "სოციალური მედიის მენეჯერი",
    bio: "სოციალური მედიის სტრატეგი, რომელიც აშენებს აქტიურ საზოგადოებებს და ქმნის აუდიტორიაზე მორგებულ კონტენტს. ფლობს მრავალპლატფორმიან ბრენდის კომუნიკაციასა და აუდიტორიის ზრდას.",
    skills: ["კონტენტ სტრატეგია", "საზოგადოების მართვა", "ანალიტიკა", "Meta Ads", "ბრენდის ხმა"],
  },
};

export function getTeamMemberKaLocalization(name: string) {
  return teamMemberKaLocalizations[name];
}
