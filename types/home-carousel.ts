export type HomeCarouselCategory =
  | "steam-wallet"
  | "chatgpt"
  | "cs2"
  | "csgo"
  | "dota2"
  | "rust";

export type HomeCarouselFilter = {
  label: string;
  value: HomeCarouselCategory;
};

export type HomeCarouselProduct = {
  accent: string;
  availability: "instant" | "available" | "limited" | "preorder";
  badge?: string;
  category: HomeCarouselCategory;
  categoryLabel: string;
  collection: string;
  description: string;
  id: string;
  imageAlt: string;
  imageUrl?: string;
  name: string;
  price: string;
  productType: string;
  rarity: string;
  stat: string;
  visualCode: string;
  wear: string;
};
