import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/features/catalog/catalog-page";
import { homeCarouselFilters } from "@/mock-data/home-carousel";
import type { HomeCarouselCategory } from "@/types/home-carousel";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
};

function getCategory(slug: string): HomeCarouselCategory | null {
  const category = homeCarouselFilters.find((filter) => filter.value === slug);

  return category?.value ?? null;
}

export function generateStaticParams() {
  return homeCarouselFilters.map((filter) => ({
    categorySlug: filter.value,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = homeCarouselFilters.find((filter) => filter.value === categorySlug);

  if (!category) {
    return {
      title: "Категория не найдена | Locker",
    };
  }

  return {
    title: `${category.label} | Каталог Locker`,
    description: `Товары Locker в категории ${category.label}.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = getCategory(categorySlug);

  if (!category) {
    notFound();
  }

  return <CatalogPage initialCategory={category} />;
}
