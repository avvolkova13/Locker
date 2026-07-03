import { RoutePlaceholder } from "@/components/shared/route-placeholder";

export default function CookiesPage() {
  return (
    <RoutePlaceholder
      eyebrow="Документ"
      text="Политика Cookie будет добавлена после утверждения аналитики, авторизации и технических cookie сайта."
      title="Политика Cookie"
    >
      <article>
        <h2>Что нужно описать</h2>
        <ul>
          <li>Cookie для работы сайта и аккаунта.</li>
          <li>Cookie для корзины и сессии пользователя.</li>
          <li>Аналитику, если она будет подключена.</li>
          <li>Способ управления cookie.</li>
        </ul>
      </article>
    </RoutePlaceholder>
  );
}
