export interface TeamMemberKaLocalization {
  bio: string;
}

export const teamMemberKaLocalizations: Record<string, TeamMemberKaLocalization> = {
  "Alex Morgan": {
    bio: "Full stack დეველოპერი React-ის, Node.js-ისა და cloud არქიტექტურის გამოცდილებით. მუშაობს მასშტაბირებადი ვებ აპლიკაციების შექმნასა და დამწყები დეველოპერების მენტორობაზე.",
  },
  "Sarah Chen": {
    bio: "Frontend სპეციალისტი დიზაინისა და წარმადობის ძლიერი ხედვით. ქმნის გლუვ, ადაპტირებულ ინტერფეისებს თანამედროვე framework-ებისა და ანიმაციის ბიბლიოთეკების გამოყენებით.",
  },
  "Marcus Johnson": {
    bio: "Backend ინჟინერი API დიზაინის, მონაცემთა ბაზების ოპტიმიზაციისა და serverless არქიტექტურის მიმართულებით. ზრუნავს, რომ აპლიკაციები ეფექტურად მუშაობდეს მასშტაბზე.",
  },
};

export function getTeamMemberKaLocalization(name: string) {
  return teamMemberKaLocalizations[name];
}
