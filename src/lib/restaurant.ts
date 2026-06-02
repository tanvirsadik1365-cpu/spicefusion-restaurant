const feastImage = "/brand/food/spice-fusion-feast.jpg";
const curryImage = "/brand/food/spice-fusion-curry.jpg";
const tandooriImage = "/brand/food/spice-fusion-tandoori-grill.jpg";
const biryaniImage = "/brand/food/spice-fusion-biryani.jpg";
const naanRiceImage = "/brand/food/spice-fusion-naan-rice.jpg";
const startersImage = "/brand/food/spice-fusion-starters.jpg";
const storefrontImage = "/brand/food/spice-fusion-storefront.jpg";
const brandLogo = "/brand/spice-fusion-logo.png";
const brandIcon = "/brand/spice-fusion-icon.png";

type MenuItem = {
  name: string;
  price: string;
  description?: string;
  popular?: boolean;
};

type MenuSection = {
  id: string;
  title: string;
  description: string;
  image: string;
  items: MenuItem[];
  priceNote?: string;
};

export const restaurant = {
  name: "Spice Fusion TAKEAWAY",
  shortName: "Spice Fusion",
  established: "",
  tagline: "Freshly Cooked Indian Takeaway",
  heroLine: "Order collection or delivery in Addingham and nearby areas.",
  description:
    "Spice Fusion Takeaway on Main St, Addingham serving appetisers, tandoori, signature curries, biryani, and set meals.",
  phone: "+44 1943 830864",
  secondaryPhone: "+44 1943 830864",
  phoneHref: "tel:+441943830864",
  secondaryPhoneHref: "tel:+441943830864",
  email: "contact@spicefusiontakeaway.co.uk",
  website: "spicefusiontakeaway.co.uk",
  siteUrl: "https://spicefusiontakeaway.co.uk",
  menuPdfUrl: "",
  address: ["137 Main St", "Addingham, Ilkley LS29 0LZ", "United Kingdom"],
  location: "137 Main St, Addingham, Ilkley LS29 0LZ, United Kingdom",
  deliveryInfo:
    "£3 delivery charge within 5 miles. Minimum order £15. Up to 7 miles with +£1 per extra mile outside 5 miles.",
  mapsUrl: "https://maps.google.com/?q=137+Main+St,+Addingham,+Ilkley+LS29+0LZ",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=137+Main+St,+Addingham,+Ilkley+LS29+0LZ&output=embed",
  googleReviewsUrl:
    "https://www.google.com/search?q=Spice+Fusion+TAKEAWAY+LS29+0LZ&oq=Spice+Fusion+TAKEAWAY+LS29+0LZ&sourceid=chrome&ie=UTF-8",
  facebookUrl: "",
  instagramUrl: "",
  hours: [
    { days: "Tuesday - Sunday", time: "5:30pm - 10:30pm" },
    { days: "Monday", time: "Closed (open on Bank Holiday Mondays)" },
  ],
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Gallery", href: "/gallery" },
  { label: "Track Order", href: "/track-order" },
  { label: "Reviews", href: "/reviews" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

export const menuFoodImages = {
  appetisers: startersImage,
  tandoori: tandooriImage,
  biryani: biryaniImage,
  curry: curryImage,
  naan: naanRiceImage,
  rice: naanRiceImage,
};

export const foodImages = {
  hero: feastImage,
  curry: menuFoodImages.curry,
  biryani: menuFoodImages.biryani,
  tandoori: menuFoodImages.tandoori,
  naan: menuFoodImages.naan,
  rice: menuFoodImages.rice,
  restaurant: brandLogo,
  exterior: storefrontImage,
  sign: brandLogo,
  bar: feastImage,
  diningRoom: storefrontImage,
  starters: menuFoodImages.appetisers,
  mainDishes: menuFoodImages.curry,
  vegetable: curryImage,
  sundries: naanRiceImage,
  lambBalti: curryImage,
  hygiene: brandIcon,
  halal: brandIcon,
};

export const brandHeroImage = foodImages.hero;
export const logoImage = brandLogo;
export const trustImages = { securePayments: "/trust/secure-payments.svg" };

export const aboutImages = [
  { src: brandLogo, alt: "Spice Fusion logo" },
  { src: feastImage, alt: "Spice Fusion takeaway feast with curry, biryani and naan" },
  { src: tandooriImage, alt: "Freshly cooked tandoori mixed grill" },
  { src: brandIcon, alt: "Spice Fusion icon" },
];

export const offers = [
  {
    title: "Order Delivery Offer",
    detail: "10% off delivery orders placed directly through the website.",
    note: "Delivery",
  },
  {
    title: "Order Collection Offer",
    detail: "15% off collection orders placed directly through the website.",
    note: "Collection",
  },
  {
    title: "Delivery Charge",
    detail: "£3 delivery charge within a 5-mile radius.",
    note: "Delivery",
  },
  {
    title: "Minimum Order",
    detail: "Minimum order for delivery is £15.",
    note: "Order rule",
  },
  {
    title: "Extended Delivery",
    detail: "Up to 7 miles maximum with +£1 per extra mile outside 5 miles.",
    note: "Distance rule",
  },
];

export const diningOffer = {
  title: "Delivery Terms",
  price: "£3",
  nonEaterPrice: "£15 min",
  discount: "N/A",
  capacity: "Up to 7 miles",
  drinks: "Soft drinks available",
  details: [
    "£3 delivery charge within 5 miles",
    "Minimum order £15",
    "Up to 7 miles maximum",
    "Additional £1 per mile outside 5 miles",
  ],
};

export const featuredDishes = [
  {
    name: "Fusion Seafood Balti",
    description: "King prawns, prawns and fish cooked with onions and capsicum in special balti sauce.",
    price: "10.95",
    badge: "Signature",
    image: curryImage,
  },
  {
    name: "Tandoori Mixed Grill",
    description: "Seekh kebab, quarter tandoori chicken, chicken tikka and lamb tikka.",
    price: "9.95",
    badge: "Popular",
    image: tandooriImage,
  },
  {
    name: "Spice Fusion Special Biryani",
    description: "Lamb tikka, chicken tikka, prawn and mushrooms cooked together.",
    price: "10.95",
    badge: "House Special",
    image: biryaniImage,
  },
];

export const menuCategories = [
  { name: "Appetisers", count: "26", detail: "Starters served with salad and mint sauce." },
  { name: "Tandoori Delicacies", count: "11", detail: "Overnight marinated and clay-oven roasted dishes." },
  { name: "Signature Dishes", count: "9", detail: "Spice Fusion signature curries and balti specials." },
  { name: "House Specialities", count: "9 options", detail: "Balti, Jalfrazi, Karahi, Achari, Saag and Bombay styles." },
  { name: "Chef's Specialities", count: "29", detail: "Chef-crafted curries from mild to very hot." },
  { name: "Traditional Curries", count: "9 options", detail: "Korma, Dhansak, Bhuna, Rogan Josh and more." },
  { name: "Vegetarian Dishes", count: "14", detail: "Vegetarian mains and sides." },
  { name: "Biryani", count: "9", detail: "Herb and spice basmati biryani dishes." },
  { name: "Rice & Breads", count: "25", detail: "Rice accompaniments, naan, chapati and roti." },
  { name: "Sundries & Snacks", count: "28", detail: "Sides, wraps, drinks and set meals." },
];

export const menuSections: MenuSection[] = [
  {
    id: "appetisers",
    title: "Appetisers",
    description: "Served with salad and mint sauce.",
    image: startersImage,
    items: [
      { name: "Lamb Chops (3 pieces)", price: "6.50" },
      { name: "Seekh Kebab (2 pieces)", price: "3.80" },
      { name: "Spicy Seekh Kebab (2 pieces)", price: "4.00" },
      { name: "Shami Kebab (2 pieces)", price: "3.80" },
      { name: "Mixed Kebab", price: "4.20", description: "Chicken kebab, seekh kebab and onion bhaji." },
      { name: "Royal Mixed Kebab", price: "4.95", description: "Seekh kebab, chicken tikka and lamb tikka." },
      { name: "Fusion Mixed Kebab for 2", price: "6.95" },
      { name: "Chicken Kebab (2 pieces)", price: "4.00" },
      { name: "Chicken Tikka (6 pieces)", price: "4.00" },
      { name: "Lamb Tikka (6 pieces)", price: "4.95" },
      { name: "Tandoori Chicken (1/4)", price: "4.00" },
      { name: "Fish Tikka (5 pieces)", price: "5.00" },
      { name: "Fish Pakora (5 pieces)", price: "5.00" },
      { name: "Chicken Pakora (5 pieces)", price: "4.00" },
      { name: "Chicken Chat on Puree", price: "4.00" },
      { name: "V Chana Chat on Puree", price: "3.90" },
      { name: "Prawn Chat on Puree", price: "5.00" },
      { name: "King Prawn Chat on Puree", price: "5.95" },
      { name: "Vegetable Chat on Puree", price: "3.90" },
      { name: "V Onion Bhaji (4 pieces)", price: "3.30" },
      { name: "V Vegetable Samosa (3 pieces)", price: "3.30" },
      { name: "Meat Samosa (3 pieces)", price: "3.50" },
      { name: "V Mushroom Pakora (5 pieces)", price: "3.30" },
      { name: "V Paneer Pakora", price: "4.00" },
      { name: "Meat Spring Roll", price: "3.50" },
      { name: "Vegetable Spring Roll", price: "3.30" },
    ],
    priceNote: "All prices in GBP (£).",
  },
  {
    id: "tandoori-delicacies",
    title: "Spice Fusion Tandoori Delicacies",
    description: "Marinated overnight then roasted in clay oven on skewers.",
    image: tandooriImage,
    items: [
      { name: "Lamb Chops Main (6 pieces)", price: "10.95" },
      { name: "Chicken Tikka", price: "7.95" },
      { name: "Lamb Tikka", price: "9.95" },
      { name: "Tandoori Chicken (Half Chicken on the bone)", price: "7.95" },
      { name: "V Paneer Shashlick", price: "7.95" },
      { name: "Chicken Tikka Shashlick", price: "8.95" },
      { name: "Lamb Tikka Shashlick", price: "9.95" },
      { name: "Tandoori Mixed Grill", price: "9.95" },
      { name: "Fish Tikka", price: "9.95" },
      { name: "Fish Tikka Shashlick", price: "9.95" },
      { name: "Tandoori King Prawn Shashlick", price: "12.95" },
    ],
  },
  {
    id: "signature-dishes",
    title: "Spice Fusion Signature Dishes",
    description: "House signature curries from medium to very hot.",
    image: curryImage,
    items: [
      { name: "Chicken Tikka Shatkora", price: "7.95" },
      { name: "Lamb Tikka Shatkora", price: "9.95" },
      { name: "Chicken Tikka Jamdhani", price: "7.95" },
      { name: "Lamb Tikka Jamdhani", price: "9.95" },
      { name: "Chicken Tikka Jalfong", price: "7.95" },
      { name: "Lamb Tikka Jalfong", price: "9.95" },
      { name: "Chicken Tikka Jal Jhool", price: "7.95" },
      { name: "Lamb Tikka Jal Jhool", price: "9.95" },
      { name: "Fusion Seafood Balti", price: "10.95" },
    ],
  },
  {
    id: "house-specialities",
    title: "House Specialities",
    description: "Choose style: Balti, Jalfrazi, Karahi, Achari, Saag, Bombay.",
    image: curryImage,
    items: [
      { name: "V Mix Vegetables", price: "6.95" },
      { name: "Chicken", price: "7.50" },
      { name: "Meat", price: "8.95" },
      { name: "Keema", price: "7.95" },
      { name: "Prawn", price: "9.95" },
      { name: "Lamb Tikka", price: "9.95" },
      { name: "Chicken Tikka", price: "7.95" },
      { name: "King Prawn", price: "11.95" },
      { name: "Fish", price: "9.95" },
    ],
  },
  {
    id: "biryani",
    title: "Biryani",
    description: "Served with vegetable curry sauce.",
    image: biryaniImage,
    items: [
      { name: "V Vegetable Biryani", price: "6.95" },
      { name: "Chicken Biryani", price: "7.95" },
      { name: "Prawn Biryani", price: "9.95" },
      { name: "Meat Biryani", price: "8.95" },
      { name: "Chicken Tikka Biryani", price: "8.50" },
      { name: "Lamb Tikka Biryani", price: "9.95" },
      { name: "King Prawn Biryani", price: "11.95" },
      { name: "Fish Biryani", price: "9.95" },
      { name: "Spice Fusion Special Biryani", price: "10.95" },
    ],
  },
  {
    id: "chefs-specialities",
    title: "Chef's Specialities",
    description: "Rich chef-crafted dishes from mild to very hot.",
    image: curryImage,
    items: [
      { name: "Chicken Muglai Jalfrazi", price: "8.50" },
      { name: "Lamb Muglai Jalfrazi", price: "9.95" },
      { name: "Chicken Tikka Masala (mild)", price: "7.95" },
      { name: "Lamb Tikka Masala (mild)", price: "9.95" },
      { name: "Chicken Tikka Passanda (mild)", price: "7.95" },
      { name: "Lamb Tikka Passanda (mild)", price: "9.95" },
      { name: "Tikka Makhani Chicken (mild)", price: "7.95" },
      { name: "Tikka Makhani Lamb (mild)", price: "10.50" },
      { name: "Tandoori Butter Chicken (mild)", price: "7.95" },
      { name: "Balti Butter Chicken", price: "7.95" },
      { name: "Bombay Balti Chicken", price: "8.50" },
      { name: "Bombay Balti Lamb", price: "9.95" },
      { name: "Tikka Spicy Masala Chicken", price: "7.95" },
      { name: "Tikka Spicy Masala Lamb", price: "9.95" },
      { name: "Fish Tikka Spicy Masala", price: "9.95" },
      { name: "Chicken Tikka Paneer", price: "7.95" },
      { name: "Kufta Paneer", price: "7.95" },
      { name: "Tikka Parsi Chicken", price: "7.95" },
      { name: "Tikka Parsi Lamb", price: "9.95" },
      { name: "Garlic Chilli Chicken", price: "8.50" },
      { name: "Garlic Chilli King Prawn", price: "11.95" },
      { name: "Fusion Exotic Tikka Chicken", price: "7.95" },
      { name: "Fusion Exotic Tikka Lamb", price: "9.95" },
      { name: "Fusion Special Tandoori Balti", price: "9.95" },
      { name: "Fusion Special Balti", price: "9.95" },
      { name: "Fusion Murgh Masala", price: "9.95" },
      { name: "Tandoori King Prawn Masala (mild)", price: "11.95" },
      { name: "Tikka Rajastani Chicken", price: "7.95" },
      { name: "Tikka Rajastani Lamb", price: "9.95" },
    ],
  },
  {
    id: "traditional-curries",
    title: "Traditional Curry Dishes",
    description: "Korma, Dhansak, Bhuna, Rogan Josh, Dupiaza, Pathia, Madras, Vindaloo.",
    image: curryImage,
    items: [
      { name: "V Mix Vegetable", price: "6.95" },
      { name: "Chicken", price: "7.50" },
      { name: "Meat", price: "8.95" },
      { name: "Keema", price: "7.95" },
      { name: "Prawn", price: "9.95" },
      { name: "Chicken Tikka", price: "7.95" },
      { name: "Lamb Tikka", price: "9.95" },
      { name: "King Prawn", price: "11.95" },
      { name: "Fish", price: "9.95" },
    ],
  },
  {
    id: "vegetarian",
    title: "Vegetarian Dishes",
    description: "Vegetarian mains and side options.",
    image: curryImage,
    items: [
      { name: "Shabzi Chot Poti", price: "6.95" },
      { name: "Vegetable Zafrani (mild)", price: "6.95" },
      { name: "Desi Vegetable Masala", price: "6.95" },
      { name: "Mixed Veg Bhaji", price: "6.50 / 3.50" },
      { name: "Mushroom Bhaji", price: "6.50 / 3.50" },
      { name: "Chana Aloo", price: "6.50 / 3.50" },
      { name: "Saag Paneer", price: "6.95 / 3.50" },
      { name: "Saag Bhaji", price: "6.50 / 3.50" },
      { name: "Aloo Gobi", price: "6.50 / 3.50" },
      { name: "Bombay Aloo", price: "6.50 / 3.50" },
      { name: "Saag Aloo", price: "6.50 / 3.50" },
      { name: "Cauliflower Bhaji", price: "6.50 / 3.50" },
      { name: "Bhindi Bhaji (Okra)", price: "6.50 / 3.50" },
      { name: "Tarka Dhall", price: "6.50 / 3.50" },
    ],
    priceNote: "Vegetarian items shown as Main / Side where applicable.",
  },
  {
    id: "rice-accompaniments",
    title: "Rice Accompaniments",
    description: "Rice sides and flavoured rice options.",
    image: naanRiceImage,
    items: [
      { name: "Pilau Rice", price: "2.80" },
      { name: "Boiled Rice", price: "2.70" },
      { name: "Keema Rice", price: "3.50" },
      { name: "Mushroom Rice", price: "3.50" },
      { name: "Lemon Rice", price: "3.50" },
      { name: "Garlic Rice", price: "3.50" },
      { name: "Coconut Rice", price: "3.50" },
      { name: "Veg Rice", price: "3.50" },
      { name: "Egg Rice", price: "3.50" },
      { name: "Peas Rice", price: "3.50" },
      { name: "Chana Rice", price: "3.50" },
      { name: "Onion Rice", price: "3.50" },
      { name: "Special Rice", price: "3.50" },
    ],
  },
  {
    id: "breads",
    title: "Breads",
    description: "Fresh naan, roti, paratha and puree.",
    image: naanRiceImage,
    items: [
      { name: "Plain Naan", price: "2.60" },
      { name: "Garlic Naan", price: "2.60" },
      { name: "Vegetable Naan", price: "2.85" },
      { name: "Keema Naan", price: "2.75" },
      { name: "Hot & Spicy Naan", price: "2.75" },
      { name: "Cheese Naan", price: "2.95" },
      { name: "Peshwari Naan", price: "2.75" },
      { name: "Chapati", price: "0.90" },
      { name: "Paratha (2x)", price: "2.50" },
      { name: "Stuffed Paratha", price: "2.90" },
      { name: "Puree", price: "0.90" },
      { name: "Tandoori Roti", price: "1.95" },
    ],
  },
  {
    id: "sundries-snacks-drinks",
    title: "Sundries, Snacks, Drinks & Set Meals",
    description: "Sides, wraps, drinks, meal deals and set menus.",
    image: naanRiceImage,
    items: [
      { name: "Chips", price: "2.50" },
      { name: "Spicy Chips", price: "2.70" },
      { name: "Cheese Chips", price: "3.00" },
      { name: "Raita", price: "1.60" },
      { name: "Salad", price: "1.30" },
      { name: "Popadom", price: "0.80" },
      { name: "Spicy Poppadom", price: "0.80" },
      { name: "Pickle Tray", price: "2.40" },
      { name: "Single Dip (each)", price: "0.70" },
      { name: "Special Salad", price: "3.00" },
      { name: "Mint Sauce", price: "0.80" },
      { name: "Chapati Wrap with Donner + Drink", price: "6.50" },
      { name: "Chapati Wrap with Chicken Tikka", price: "6.50" },
      { name: "Chicken Tikka on Naan/Chips", price: "7.95" },
      { name: "Donner Meat on Naan/Chips", price: "7.50" },
      { name: "Mixed Donner on Naan/Chips", price: "8.95" },
      { name: "Chicken Nuggets", price: "7.50" },
      { name: "Cans (Coke, Pepsi, Fanta, Mango Rubicon)", price: "1.30" },
      { name: "Bottle 1.5ltr", price: "2.95" },
      { name: "Meal Deal", price: "11.95", description: "Popadom, salad, mint sauce, meat or veg samosa, one traditional chicken/meat/vegetable dish, pilau rice and Coke or Diet Coke." },
      { name: "Set Meal for 4", price: "59.95", description: "4 popadoms, salad, mint sauce, onion bhaji, chicken tikka, seekh kebab, meat samosa, four mains, two sides, rice and naan." },
      { name: "Set Meal 1", price: "11.95", description: "Popadom, salad, mint sauce, onion bhaji, chicken tikka masala and pilau rice." },
      { name: "Set Meal 2", price: "26.95", description: "Popadom, salad, mint sauce, onion bhaji, chicken tikka, chicken tikka masala, meat bhuna, saag aloo, pilau rice and naan." },
      { name: "Vegetarian Set Meal 1", price: "10.50", description: "Popadom, salad, mint sauce, onion bhaji, vegetable balti and pilau rice." },
      { name: "Tandoori Set Meal 1", price: "12.95", description: "Popadom, salad, mint sauce, seekh kebab, chicken tikka shashlick and plain naan." },
    ],
    priceNote: "Please check allergy and offer terms before ordering.",
  },
];

export type GalleryImageData = {
  title: string;
  chapter: string;
  caption: string;
  src: string;
  alt: string;
  mood: string;
  category?: string;
  href?: string;
};

export const galleryImages: GalleryImageData[] = [
  {
    title: "Spice Fusion Logo",
    chapter: "Brand",
    caption: "Official Spice Fusion Takeaway logo.",
    src: brandLogo,
    alt: "Spice Fusion Takeaway logo",
    mood: "Bold",
    category: "Brand",
    href: "/menu",
  },
  {
    title: "Signature Dishes",
    chapter: "Menu",
    caption: "Explore tandoori, signature dishes and biryani.",
    src: feastImage,
    alt: "Spice Fusion signature dishes",
    mood: "Food",
    category: "Food",
    href: "/menu",
  },
  {
    title: "Tandoori Mixed Grill",
    chapter: "Menu",
    caption: "Chicken tikka, seekh kebab, lamb tikka and tandoori chicken.",
    src: tandooriImage,
    alt: "Spice Fusion tandoori mixed grill platter",
    mood: "Smoky",
    category: "Food",
    href: "/menu",
  },
  {
    title: "Biryani",
    chapter: "Menu",
    caption: "Golden basmati biryani served with curry sauce.",
    src: biryaniImage,
    alt: "Spice Fusion biryani dish",
    mood: "Comfort",
    category: "Food",
    href: "/menu",
  },
  {
    title: "Fresh Breads & Rice",
    chapter: "Sides",
    caption: "Garlic naan, pilau rice, poppadoms and chutneys.",
    src: naanRiceImage,
    alt: "Spice Fusion naan, rice and sundries",
    mood: "Sides",
    category: "Food",
    href: "/menu",
  },
  {
    title: "Addingham Takeaway",
    chapter: "Location",
    caption: "A welcoming takeaway-style storefront for local collection.",
    src: storefrontImage,
    alt: "Spice Fusion takeaway storefront style image",
    mood: "Local",
    category: "Location",
    href: "/contact",
  },
];

export const reviews = [
  {
    name: "Customer Review",
    date: "Recent",
    title: "Great takeaway",
    text: "Fresh food, quick service, and generous portions.",
    helpful: 1,
  },
];

export const faqs = [
  {
    category: "Delivery",
    question: "What is the minimum delivery order?",
    answer: "Minimum order for delivery is £15.",
  },
  {
    category: "Delivery",
    question: "What are your delivery charges?",
    answer:
      "Delivery is £3 within 5 miles. Orders outside 5 miles are charged an additional £1 per mile up to 7 miles max.",
  },
  {
    category: "Location",
    question: "Where are you located?",
    answer: "137 Main St, Addingham, Ilkley LS29 0LZ, United Kingdom.",
  },
  {
    category: "Hours",
    question: "What are your opening times?",
    answer:
      "Open Tuesday to Sunday from 5:30pm to 10:30pm. Closed Mondays except Bank Holidays.",
  },
];
