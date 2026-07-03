import { LockerButton } from "@/components/shared/locker-button";
import { RoutePlaceholder } from "@/components/shared/route-placeholder";
import { APP_ROUTES } from "@/constants/routes";

export default function CheckoutPage() {
  return (
    <RoutePlaceholder
      actions={<LockerButton href={APP_ROUTES.balance}>Пополнить баланс</LockerButton>}
      eyebrow="Оформление"
      text="Оформление должно проверить авторизацию, баланс, данные для выдачи и условия товара до списания средств."
      title="Оформление заказа"
    >
      <article>
        <h2>Перед оплатой</h2>
        <ul>
          <li>Пользователь должен быть авторизован.</li>
          <li>На балансе должно быть достаточно средств.</li>
          <li>Для игровых предметов проверяются необходимые данные Steam.</li>
        </ul>
      </article>
      <article>
        <h2>После подтверждения</h2>
        <p>Заказ передаётся поставщику через API и получает статус, который отображается в профиле.</p>
      </article>
    </RoutePlaceholder>
  );
}
