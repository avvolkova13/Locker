import { RoutePlaceholder } from "@/components/shared/route-placeholder";

export default function ContactsPage() {
  return (
    <RoutePlaceholder
      eyebrow="Связь"
      text="Контакты поддержки будут добавлены после подтверждения рабочих каналов связи и юридических реквизитов."
      title="Контакты"
    >
      <article>
        <h2>Поддержка</h2>
        <p>Канал обращения должен помогать по оплате, статусам заказа, выдаче товара и данным Steam.</p>
      </article>
      <article>
        <h2>Юридическая информация</h2>
        <p>Реквизиты будут опубликованы после подтверждения юридического лица и страны регистрации.</p>
      </article>
    </RoutePlaceholder>
  );
}
