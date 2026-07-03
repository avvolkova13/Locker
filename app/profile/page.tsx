import { LockerButton } from "@/components/shared/locker-button";
import { RoutePlaceholder } from "@/components/shared/route-placeholder";
import { APP_ROUTES } from "@/constants/routes";

export default function ProfilePage() {
  return (
    <RoutePlaceholder
      actions={<LockerButton href={APP_ROUTES.purchaseHistory}>История покупок</LockerButton>}
      eyebrow="Аккаунт Locker"
      text="Профиль объединяет баланс, покупки и данные, которые могут понадобиться для выдачи цифровых товаров."
      title="Профиль"
    >
      <article>
        <h2>Минимальный состав</h2>
        <ul>
          <li>Баланс пользователя.</li>
          <li>Корзина и текущие заказы.</li>
          <li>История приобретённых товаров.</li>
          <li>Статусы выдачи и действия, если они требуются.</li>
        </ul>
      </article>
      <article>
        <h2>Состояние</h2>
        <p>Реальные данные профиля появятся после подключения авторизации, баланса и API поставщиков.</p>
      </article>
    </RoutePlaceholder>
  );
}
