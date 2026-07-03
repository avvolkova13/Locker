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
  badge?: string;
  category: HomeCarouselCategory;
  categoryLabel: string;
  description: string;
  id: string;
  imageAlt: string;
  imageUrl?: string;
  name: string;
  price: string;
  source: string;
  sourceUrl: string;
  stat: string;
  visualCode: string;
};
