import { RoutePlaceholder } from "@/components/shared/route-placeholder";

export default function CookiesPage() {
  return (
    <RoutePlaceholder
      eyebrow="Документ"
      text="Политика описывает cookie для работы сайта, аккаунта, корзины и настроек пользователя."
      title="Политика Cookie"
    >
      <article>
        <h2>Что нужно описать</h2>
        <ul>
          <li>Cookie для работы сайта и аккаунта.</li>
          <li>Cookie для корзины и сессии пользователя.</li>
          <li>Cookie для измерения качества работы сайта.</li>
          <li>Способ управления cookie.</li>
        </ul>
      </article>
    </RoutePlaceholder>
  );
}
