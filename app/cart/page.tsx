import { LockerButton } from "@/components/shared/locker-button";
import { RoutePlaceholder } from "@/components/shared/route-placeholder";
import { APP_ROUTES } from "@/constants/routes";

export default function CartPage() {
  return (
    <RoutePlaceholder
      actions={<LockerButton href={APP_ROUTES.catalog}>Вернуться в каталог</LockerButton>}
      eyebrow="Покупка"
      text="Корзина собирает выбранные товары перед оформлением. Оплата будет доступна только после входа и пополнения внутреннего баланса."
      title="Корзина"
    >
      <article>
        <h2>Порядок покупки</h2>
        <ol>
          <li>Проверьте товар, цену и условия выдачи.</li>
          <li>Войдите в аккаунт Locker.</li>
          <li>Пополните баланс.</li>
          <li>Подтвердите покупку.</li>
        </ol>
      </article>
      <article>
        <h2>Состояние</h2>
        <p>Корзина пока не хранит товары. Реальная логика будет подключена вместе с аккаунтом и checkout.</p>
      </article>
    </RoutePlaceholder>
  );
}
