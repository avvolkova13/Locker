import Link from "next/link";
import { RoutePlaceholder } from "@/components/shared/route-placeholder";
import { APP_ROUTES } from "@/constants/routes";

export default function LegalPage() {
  return (
    <RoutePlaceholder
      eyebrow="Документы"
      text="Юридическая информация будет добавлена после подтверждения реквизитов."
      title="Правовая информация"
    >
      <article>
        <h2>Документы</h2>
        <ul>
          <li>
            <Link href={APP_ROUTES.userAgreement}>Пользовательское соглашение</Link>
          </li>
          <li>
            <Link href={APP_ROUTES.privacy}>Политика конфиденциальности</Link>
          </li>
          <li>
            <Link href={APP_ROUTES.cookies}>Политика Cookie</Link>
          </li>
        </ul>
      </article>
      <article>
        <h2>Статус</h2>
        <p>Тексты документов зависят от юридического лица, страны регистрации, платёжного провайдера и требований комплаенса.</p>
      </article>
    </RoutePlaceholder>
  );
}
