import { LockerButton } from "@/components/shared/locker-button";
import { RoutePlaceholder } from "@/components/shared/route-placeholder";
import { APP_ROUTES } from "@/constants/routes";

export default function AuthPage() {
  return (
    <RoutePlaceholder
      actions={<LockerButton href={APP_ROUTES.catalog}>Перейти в каталог</LockerButton>}
      eyebrow="Аккаунт"
      text="Вход нужен для корзины, баланса и истории покупок. Форма авторизации будет подключена после утверждения backend-логики."
      title="Вход и регистрация"
    >
      <article>
        <h2>Что будет доступно</h2>
        <ul>
          <li>Просмотр внутреннего баланса.</li>
          <li>Оплата покупок средствами баланса.</li>
          <li>История приобретённых товаров.</li>
          <li>Данные Steam для игровых предметов, если они понадобятся.</li>
        </ul>
      </article>
      <article>
        <h2>До оплаты</h2>
        <p>Если пользователь не авторизован, оформление покупки должно предложить вход или регистрацию.</p>
      </article>
    </RoutePlaceholder>
  );
}
