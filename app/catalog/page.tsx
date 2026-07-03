import type { Metadata } from "next";
import { CatalogPage as Catalog } from "@/features/catalog/catalog-page";

export default function CatalogPageRoute() {
  return <Catalog />;
}

export const metadata: Metadata = {
  title: "Каталог | Locker",
  description: "Каталог цифровых товаров Locker: Steam Wallet, ChatGPT, игровые скины и подписки.",
};
