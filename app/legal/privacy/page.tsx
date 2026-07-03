import { RoutePlaceholder } from "@/components/shared/route-placeholder";

export default function PrivacyPage() {
  return (
    <RoutePlaceholder
      eyebrow="Документ"
      text="Политика конфиденциальности будет добавлена после утверждения состава данных, авторизации, платежей и интеграций поставщиков."
      title="Политика конфиденциальности"
    >
      <article>
        <h2>Что нужно описать</h2>
        <ul>
          <li>Какие данные хранит аккаунт Locker.</li>
          <li>Какие данные нужны для оплаты и выдачи товара.</li>
          <li>Как обрабатываются Steam-данные, если они требуются.</li>
          <li>Какие поставщики участвуют в обработке заказа.</li>
        </ul>
      </article>
    </RoutePlaceholder>
  );
}
