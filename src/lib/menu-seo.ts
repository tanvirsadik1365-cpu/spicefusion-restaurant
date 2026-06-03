import { foodImages } from "@/lib/restaurant";

export type DishSeoPage = {
  slug: string;
  name: string;
  title: string;
  description: string;
  h1: string;
  image: string;
  imageAlt: string;
  intro: string;
  highlights: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export const dishSeoPages: DishSeoPage[] = [
  {
    slug: "chicken-tikka-masala",
    name: "Chicken Tikka Masala",
    title: "Chicken Tikka Masala Addingham | Spice Fusion Takeaway",
    description:
      "Order chicken tikka masala in Addingham from Spice Fusion Takeaway. Mild, creamy Indian takeaway for collection or local delivery near Ilkley.",
    h1: "Chicken Tikka Masala in Addingham",
    image: foodImages.curry,
    imageAlt: "Chicken tikka masala curry from Spice Fusion Takeaway Addingham",
    intro:
      "Chicken tikka masala is a mild, creamy favourite for Indian takeaway customers in Addingham, Ilkley and LS29. Order direct from Spice Fusion for collection or local delivery.",
    highlights: ["Mild creamy curry", "Popular with families", "Available for collection and delivery"],
    faqs: [
      {
        question: "Is Chicken Tikka Masala mild?",
        answer:
          "Yes. Chicken tikka masala is one of the milder Spice Fusion curry dishes, cooked with a creamy masala sauce.",
      },
      {
        question: "Can I order Chicken Tikka Masala for delivery to Ilkley?",
        answer:
          "Spice Fusion offers local delivery across Addingham and nearby LS29 areas, with a 5-mile delivery radius and a maximum of 7 miles.",
      },
    ],
  },
  {
    slug: "lamb-biryani",
    name: "Lamb Biryani",
    title: "Lamb Biryani Ilkley & Addingham | Spice Fusion Takeaway",
    description:
      "Order lamb biryani from Spice Fusion Takeaway near Ilkley. Basmati rice, herbs and spices served with vegetable curry sauce.",
    h1: "Lamb Biryani near Ilkley",
    image: foodImages.biryani,
    imageAlt: "Lamb biryani takeaway near Ilkley from Spice Fusion Addingham",
    intro:
      "Lamb biryani is prepared with basmati rice, herbs and spices, making it a satisfying Indian takeaway choice for Addingham, Ilkley and West Yorkshire customers.",
    highlights: ["Served with vegetable curry sauce", "Aromatic basmati rice", "Good choice for curry and rice lovers"],
    faqs: [
      {
        question: "What comes with Lamb Biryani?",
        answer:
          "Spice Fusion biryani dishes are served with a vegetable curry sauce.",
      },
      {
        question: "Do you offer biryani delivery in Addingham?",
        answer:
          "Yes. Delivery is available locally from Spice Fusion, with collection and delivery offers available online.",
      },
    ],
  },
  {
    slug: "chicken-tikka-shatkora",
    name: "Chicken Tikka Shatkora",
    title: "Chicken Tikka Shatkora Addingham | Bangladeshi Curry",
    description:
      "Try Chicken Tikka Shatkora from Spice Fusion Addingham, a Bangladeshi-style curry with hot, sour and tangy citrus flavour.",
    h1: "Chicken Tikka Shatkora in Addingham",
    image: foodImages.curry,
    imageAlt: "Chicken tikka shatkora Bangladeshi curry in Addingham",
    intro:
      "Chicken Tikka Shatkora brings a Bangladeshi citrus character to takeaway curry, using shatkora for a hot, sour and tangy flavour.",
    highlights: ["Bangladeshi-inspired citrus flavour", "Cooked with shatkora", "Great for adventurous curry fans"],
    faqs: [
      {
        question: "What is Chicken Tikka Shatkora?",
        answer:
          "It is chicken tikka cooked with shatkora, a citrus fruit used in Bangladeshi cuisine for a hot, sour and tangy taste.",
      },
      {
        question: "Is Shatkora curry spicy?",
        answer:
          "Shatkora dishes have a lively hot, sour flavour. Ask the restaurant if you would like the heat adjusted.",
      },
    ],
  },
  {
    slug: "lamb-tikka-jamdhani",
    name: "Lamb Tikka Jamdhani",
    title: "Lamb Tikka Jamdhani Addingham | Spice Fusion Curry",
    description:
      "Order Lamb Tikka Jamdhani from Spice Fusion Takeaway. A local Addingham curry with onions, tomatoes, coriander, cauliflower and spicy potatoes.",
    h1: "Lamb Tikka Jamdhani in Addingham",
    image: foodImages.curry,
    imageAlt: "Lamb tikka jamdhani curry from Spice Fusion Takeaway",
    intro:
      "Lamb Tikka Jamdhani is a Spice Fusion signature dish cooked with onions, tomatoes and coriander, then layered with cauliflower and spicy potatoes.",
    highlights: ["Signature curry", "Layered with vegetables", "Available for direct online ordering"],
    faqs: [
      {
        question: "What is in Lamb Tikka Jamdhani?",
        answer:
          "It is cooked with onions, tomatoes and coriander, then layered with cauliflower and spicy potatoes.",
      },
      {
        question: "Can I collect Lamb Tikka Jamdhani?",
        answer:
          "Yes. Spice Fusion offers collection from 137 Main St, Addingham, with a collection discount online.",
      },
    ],
  },
  {
    slug: "tandoori-mixed-grill",
    name: "Tandoori Mixed Grill",
    title: "Tandoori Mixed Grill Addingham | Indian Grill Takeaway",
    description:
      "Order Tandoori Mixed Grill in Addingham from Spice Fusion. Seekh kebab, tandoori chicken, chicken tikka and lamb tikka.",
    h1: "Tandoori Mixed Grill in Addingham",
    image: foodImages.tandoori,
    imageAlt: "Tandoori mixed grill Indian takeaway in Addingham",
    intro:
      "Tandoori Mixed Grill is a generous clay-oven selection for customers who want kebab, tandoori chicken, chicken tikka and lamb tikka in one meal.",
    highlights: ["Cooked in the tandoor", "Mixed meat selection", "Popular takeaway grill option"],
    faqs: [
      {
        question: "What is included in Tandoori Mixed Grill?",
        answer:
          "The dish includes seekh kebab, quarter tandoori chicken, chicken tikka and lamb tikka.",
      },
      {
        question: "Is Tandoori Mixed Grill good for sharing?",
        answer:
          "It is a generous grill option and can work well alongside rice, naan and sides.",
      },
    ],
  },
  {
    slug: "fusion-special-balti",
    name: "Fusion Special Balti",
    title: "Fusion Special Balti Addingham | Curry Delivery LS29",
    description:
      "Order Fusion Special Balti from Spice Fusion Addingham. Chicken, meat, prawns and mushrooms cooked balti style.",
    h1: "Fusion Special Balti in Addingham",
    image: foodImages.curry,
    imageAlt: "Fusion Special Balti curry delivery in Addingham LS29",
    intro:
      "Fusion Special Balti combines chicken, meat, prawns and mushrooms in a rich balti-style curry for direct collection or delivery in Addingham.",
    highlights: ["House special balti", "Chicken, meat, prawns and mushrooms", "Great with naan or pilau rice"],
    faqs: [
      {
        question: "What is in Fusion Special Balti?",
        answer:
          "It includes chicken, meat, prawns and mushrooms cooked in a balti style.",
      },
      {
        question: "Do you deliver Balti dishes in LS29?",
        answer:
          "Spice Fusion delivers locally in Addingham and nearby LS29 areas subject to delivery distance and minimum order.",
      },
    ],
  },
  {
    slug: "fusion-special-biryani",
    name: "Spice Fusion Special Biryani",
    title: "Spice Fusion Special Biryani Addingham | Biryani Takeaway",
    description:
      "Order Spice Fusion Special Biryani in Addingham. Lamb tikka, chicken tikka, prawn and mushrooms cooked with aromatic rice.",
    h1: "Spice Fusion Special Biryani in Addingham",
    image: foodImages.biryani,
    imageAlt: "Spice Fusion special biryani takeaway in Addingham",
    intro:
      "Spice Fusion Special Biryani is a house biryani with lamb tikka, chicken tikka, prawn and mushrooms, prepared with aromatic basmati rice.",
    highlights: ["House special biryani", "Mixed lamb tikka, chicken tikka and prawn", "Served with vegetable curry sauce"],
    faqs: [
      {
        question: "What is in Spice Fusion Special Biryani?",
        answer:
          "It is a mixture of lamb tikka, chicken tikka, prawn and mushrooms cooked together.",
      },
      {
        question: "Can I order biryani for collection?",
        answer:
          "Yes. Spice Fusion offers online collection from Addingham with collection discounts available.",
      },
    ],
  },
];

export function getDishSeoPage(slug: string) {
  return dishSeoPages.find((page) => page.slug === slug);
}
