import { RoutePlaceholder } from "@/components/shared/route-placeholder";

export default function FaqPage() {
  return (
    <RoutePlaceholder
      eyebrow=""
      text="Короткие ответы по покупке, балансу, Steam-данным и статусам заказа."
      title="Вопросы и ответы"
    >
      <details>
        <summary>Что такое внутренний баланс?</summary>
        <p>Это счёт в Локерсах (LK). Его можно пополнить картой или через СБП, а покупки списываются с баланса.</p>
      </details>
      <details>
        <summary>Когда приходит товар?</summary>
        <p>После оплаты Locker обрабатывает заказ. Если выдача автоматическая, товар приходит после проверки заказа.</p>
      </details>
      <details>
        <summary>Что нужно для покупки скина?</summary>
        <p>Для игровых предметов могут понадобиться данные Steam. Если они нужны, мы покажем это до оплаты.</p>
      </details>
      <details>
        <summary>Что будет, если товар не получится выдать?</summary>
        <p>Заказ получит отдельный статус. Пользователь увидит, что произошло и какое действие требуется дальше.</p>
      </details>
      <details>
        <summary>Где посмотреть покупки?</summary>
        <p>Все приобретённые товары отображаются в профиле пользователя.</p>
      </details>
    </RoutePlaceholder>
  );
}
