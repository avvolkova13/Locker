import { LockerButton } from "@/components/shared/locker-button";
import { RoutePlaceholder } from "@/components/shared/route-placeholder";
import { APP_ROUTES } from "@/constants/routes";

export default function BalancePage() {
  return (
    <RoutePlaceholder
      actions={<LockerButton href={APP_ROUTES.catalog}>Выбрать товар</LockerButton>}
      eyebrow="Внутренний счёт"
      text="Баланс используется для оплаты покупок внутри Locker. Пополнение банковской картой и через СБП будет подключено после платёжной интеграции."
      title="Баланс"
    >
      <article>
        <h2>Как работает баланс</h2>
        <ol>
          <li>Пользователь пополняет внутренний счёт.</li>
          <li>Средства отображаются в аккаунте Locker.</li>
          <li>Покупка оплачивается только с внутреннего баланса.</li>
        </ol>
      </article>
      <article>
        <h2>Статус интеграции</h2>
        <p>Реальные платежи не подключены. Способы оплаты зависят от платёжного провайдера и юридических реквизитов.</p>
      </article>
    </RoutePlaceholder>
  );
}
