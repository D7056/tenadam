import AvatarImage from "../assets/avatar.png";
import Charity from "../assets/charity.webp";

export type CauseCategory = "individual" | "organization";

export type Cause = {
  id: string;
  category: CauseCategory;
  name: string;
  tagline: string;
  description: string;
  location: string;
  image: string;
  goalAmount: number;
  raisedAmount: number;
};

export const causes: Cause[] = [
  {
    id: "selam-getachew",
    category: "individual",
    name: "Selam Getachew",
    tagline: "Needs kidney surgery",
    description:
      "Selam is a 34-year-old mother of two who needs urgent kidney surgery. Your donation helps cover the operation and recovery care.",
    location: "Addis Ababa",
    image: AvatarImage,
    goalAmount: 150000,
    raisedAmount: 62000,
  },
  {
    id: "yonas-bekele",
    category: "individual",
    name: "Yonas Bekele",
    tagline: "Child leukemia treatment",
    description:
      "Yonas is 7 years old and undergoing chemotherapy. Donations go directly toward treatment costs and hospital stays.",
    location: "Bahir Dar",
    image: AvatarImage,
    goalAmount: 220000,
    raisedAmount: 95000,
  },
  {
    id: "marta-alemu",
    category: "individual",
    name: "Marta Alemu",
    tagline: "Recovering from an accident",
    description:
      "Marta needs physical therapy and follow-up care after a serious road accident. Every contribution speeds her recovery.",
    location: "Hawassa",
    image: AvatarImage,
    goalAmount: 80000,
    raisedAmount: 41000,
  },
  {
    id: "tenadam-mobile-clinic",
    category: "organization",
    name: "Tenadam Mobile Clinic",
    tagline: "Free checkups for rural villages",
    description:
      "Our mobile clinic brings doctors and basic medicine to villages without nearby healthcare access.",
    location: "Addis Ababa",
    image: Charity,
    goalAmount: 500000,
    raisedAmount: 210000,
  },
  {
    id: "hope-childrens-fund",
    category: "organization",
    name: "Hope Children's Fund",
    tagline: "Pediatric care for underserved families",
    description:
      "We fund pediatric checkups, vaccinations, and emergency care for children from low-income families.",
    location: "Mekelle",
    image: Charity,
    goalAmount: 350000,
    raisedAmount: 180000,
  },
  {
    id: "community-medicine-bank",
    category: "organization",
    name: "Community Medicine Bank",
    tagline: "Free medicine for low-income patients",
    description:
      "We stock and distribute essential medicine at no cost to patients who can't afford their prescriptions.",
    location: "Dire Dawa",
    image: Charity,
    goalAmount: 400000,
    raisedAmount: 260000,
  },
];

export function getCauseById(causeId: string | undefined) {
  return causes.find((cause) => cause.id === causeId) ?? causes[0];
}
