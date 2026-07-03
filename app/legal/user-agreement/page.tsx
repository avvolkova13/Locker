import { RoutePlaceholder } from "@/components/shared/route-placeholder";

export default function UserAgreementPage() {
  return (
    <RoutePlaceholder
      eyebrow="Документ"
      text="Пользовательское соглашение будет добавлено после подтверждения юридического лица, страны регистрации и правил покупки цифровых товаров."
      title="Пользовательское соглашение"
    >
      <article>
        <h2>Что нужно указать</h2>
        <ul>
          <li>Правила регистрации и авторизации.</li>
          <li>Правила пополнения внутреннего баланса.</li>
          <li>Условия покупки и выдачи цифровых товаров.</li>
          <li>Порядок действий при ошибке выдачи.</li>
        </ul>
      </article>
    </RoutePlaceholder>
  );
}
