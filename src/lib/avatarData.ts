export interface AvatarItem {
  id: string;
  name: string;
  url: string;
  category: "Male" | "Female" | "Professional" | "Student" | "Minimal" | "AI Style";
}

export const PREDEFINED_AVATARS: AvatarItem[] = [
  // Male
  { id: "m-1", name: "Liam", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Liam", category: "Male" },
  { id: "m-2", name: "Noah", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Noah", category: "Male" },
  { id: "m-3", name: "Oliver", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver", category: "Male" },
  { id: "m-4", name: "Jack", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack", category: "Jack" as any },

  // Female
  { id: "f-1", name: "Emma", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Emma", category: "Female" },
  { id: "f-2", name: "Sophia", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Sophia", category: "Female" },
  { id: "f-3", name: "Mia", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Mia", category: "Female" },
  { id: "f-4", name: "Zoe", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Zoe", category: "Female" },

  // Professional
  { id: "p-1", name: "Executive Alex", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&eyebrowType=defaultNatural&facialHairProbability=0&mouthType=smile", category: "Professional" },
  { id: "p-2", name: "Director Sarah", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&glassesProbability=100&mouthType=tongue", category: "Professional" },
  { id: "p-3", name: "Manager James", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=James&topType=shortHair&accessoriesType=prescription01", category: "Professional" },
  { id: "p-4", name: "Analyst Elena", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena&topType=longHairBigHair&accessoriesType=none", category: "Professional" },

  // Student
  { id: "s-1", name: "Cole", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cole", category: "Student" },
  { id: "s-2", name: "Karly", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Karly", category: "Student" },
  { id: "s-3", name: "Toby", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Toby", category: "Student" },
  { id: "s-4", name: "Lulu", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Lulu", category: "Student" },

  // Minimal
  { id: "min-1", name: "Sleek Dark", url: "https://api.dicebear.com/7.x/initials/svg?seed=Nova&backgroundColor=2e0854,4c1d95&fontSize=42", category: "Minimal" },
  { id: "min-2", name: "Aero Light", url: "https://api.dicebear.com/7.x/initials/svg?seed=AI&backgroundColor=0284c7,0369a1&fontSize=42", category: "Minimal" },
  { id: "min-3", name: "Emerald Mint", url: "https://api.dicebear.com/7.x/initials/svg?seed=EM&backgroundColor=059669,047857&fontSize=42", category: "Minimal" },
  { id: "min-4", name: "Sunset Gold", url: "https://api.dicebear.com/7.x/initials/svg?seed=SG&backgroundColor=ea580c,c2410c&fontSize=42", category: "Minimal" },

  // AI Style
  { id: "ai-1", name: "Cyber Synth", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Cyber&colors[]=purple&sides[]=antenna", category: "AI Style" },
  { id: "ai-2", name: "Quantum Bot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Quantum&colors[]=blue&mouth[]=smile", category: "AI Style" },
  { id: "ai-3", name: "Matrix Node", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Matrix&colors[]=green&textureProbability=100", category: "AI Style" },
  { id: "ai-4", name: "Neon Spark", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Neon&colors[]=amber&eyes[]=sensor", category: "AI Style" }
] as AvatarItem[];

export const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/initials/svg?seed=NovaUser&backgroundColor=4f46e5";
