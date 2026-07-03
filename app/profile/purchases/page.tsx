import { LockerButton } from "@/components/shared/locker-button";
import { RoutePlaceholder } from "@/components/shared/route-placeholder";
import { APP_ROUTES } from "@/constants/routes";

export default function PurchaseHistoryPage() {
  return (
    <RoutePlaceholder
      actions={<LockerButton href={APP_ROUTES.catalog}>Открыть каталог</LockerButton>}
      eyebrow="Покупки"
      text="Все приобретённые товары должны отображаться здесь после оплаты и обработки заказа."
      title="История покупок"
    >
      <article>
        <h2>Статусы</h2>
        <ul>
          <li>Заказ создан.</li>
          <li>Передан поставщику.</li>
          <li>В обработке.</li>
          <li>Получен.</li>
          <li>Ошибка или требуется действие.</li>
        </ul>
      </article>
      <article>
        <h2>Пока покупок нет</h2>
        <p>История начнёт заполняться после подключения checkout, баланса и поставщиков.</p>
      </article>
    </RoutePlaceholder>
  );
}
