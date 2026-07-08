import type { HomeCarouselProduct } from "@/types/home-carousel";

export const WEAR_MARKS = [
  { label: "0.00 FN", value: 0 },
  { label: "0.07 MW", value: 0.07 },
  { label: "0.15 FT", value: 0.15 },
  { label: "0.38 WW", value: 0.38 },
  { label: "0.45 BS", value: 0.45 },
];

export function getProductFamily(product: HomeCarouselProduct) {
  const [family] = product.name.split("|").map((part) => part.trim());

  return family || product.productType;
}

export function getProductDisplayName(product: HomeCarouselProduct) {
  const [, skinName] = product.name.split("|").map((part) => part.trim());

  return skinName || product.name;
}

export function getFloatValue(product: HomeCarouselProduct) {
  const value = `${product.wear} ${product.description}`.match(/\b(?:0|1)\.\d+\b/)?.[0];

  return value ? Number(value) : null;
}

export function getWearShort(product: HomeCarouselProduct) {
  const source = `${product.wear} ${product.description} ${product.stat}`.toLowerCase();

  if (source.includes("factory new") || source.includes("прямо с завода") || source.includes(" fn")) {
    return "FN";
  }

  if (source.includes("minimal wear") || source.includes("немного понош")) {
    return "MW";
  }

  if (source.includes("field-tested") || source.includes("полев")) {
    return "FT";
  }

  if (source.includes("well-worn") || source.includes("поношен")) {
    return "WW";
  }

  if (source.includes("battle-scarred") || source.includes("закал")) {
    return "BS";
  }

  return null;
}

export function getWearLabel(product: HomeCarouselProduct) {
  const short = getWearShort(product);

  if (short === "FN") {
    return "Прямо с завода";
  }

  if (short === "MW") {
    return "Немного поношенная";
  }

  if (short === "FT") {
    return "После полевых испытаний";
  }

  if (short === "WW") {
    return "Поношенная";
  }

  if (short === "BS") {
    return "Закалённая в боях";
  }

  return product.wear;
}

export function getFloatPosition(product: HomeCarouselProduct) {
  const value = getFloatValue(product);

  if (value === null) {
    return null;
  }

  return Math.min(100, Math.max(0, value * 100));
}

export function productHasStatTrak(product: HomeCarouselProduct) {
  return /stattrak|st™/i.test(`${product.name} ${product.description} ${product.imageAlt}`);
}

export function productHasSouvenir(product: HomeCarouselProduct) {
  return /souvenir/i.test(`${product.name} ${product.description} ${product.imageAlt}`);
}

export function getProductDescription(product: HomeCarouselProduct) {
  if (product.id.includes("ak47-wild-lotus")) {
    return "AK-47 — одна из самых узнаваемых штурмовых винтовок в CS2. Wild Lotus ценят за редкую коллекцию St. Marc, насыщенный растительный рисунок и высокий спрос среди коллекционеров.";
  }

  if (product.id.includes("butterfly-doppler")) {
    return "Butterfly Knife | Doppler Ruby — редкий нож с рубиновым фазовым покрытием. Предмет выглядит ярко в инвентаре и обычно относится к самым заметным позициям ножевого рынка.";
  }

  if (product.id.includes("dragon-lore")) {
    return "AWP | Dragon Lore — культовый снайперский скин из The Cobblestone Collection. Его выбирают за узнаваемый драконий орнамент, редкость и коллекционную ликвидность.";
  }

  if (product.id.includes("gungnir")) {
    return "AWP | Gungnir — скин из The Norse Collection с холодной скандинавской графикой. Позиция относится к дорогим коллекционным AWP и редко встречается в хорошем состоянии.";
  }

  if (product.id.includes("howl")) {
    return "M4A4 | Howl — контрабандный скин с агрессивной иллюстрацией. Это одна из самых узнаваемых редких позиций M4A4 на рынке CS.";
  }

  if (product.category === "cs2" || product.category === "csgo") {
    return `${product.name} — предмет ${product.productType.toLowerCase()} с указанным состоянием, коллекцией и редкостью. Перед покупкой проверьте цену, наличие и параметры передачи.`;
  }

  return product.description;
}

export function getAvailabilityText(product: HomeCarouselProduct) {
  if (product.availability === "instant") {
    return "В наличии • мгновенная выдача";
  }

  if (product.availability === "limited") {
    return "В наличии • доставка до 12 часов";
  }

  if (product.availability === "preorder") {
    return "Под заказ • срок покажем перед оплатой";
  }

  return "В наличии • выдача после оплаты";
}
