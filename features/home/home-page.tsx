import Link from "next/link";
import { LockerButton } from "@/components/shared/locker-button";
import { APP_ROUTES } from "@/constants/routes";
import { HashScrollRestorer } from "./hash-scroll-restorer";
import { HeroApeBackground } from "./hero-ape-background";
import { HeroProductCube } from "./hero-product-cube";
import { ProductCarousel } from "./product-carousel";
import styles from "./home-page.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <Link className={styles.logo} href={APP_ROUTES.home} aria-label="Главная Locker">
        Locker
      </Link>
      <nav className={styles.nav} aria-label="Основная навигация">
        <Link href="#goods">Товары</Link>
        <Link href="#purchase">Как купить</Link>
        <Link href="#faq">Вопросы</Link>
      </nav>
      <div className={styles.headerActions}>
        <LockerButton href={APP_ROUTES.auth} size="compact" variant="ghost">
          Войти
        </LockerButton>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <HeroApeBackground />
      <div className={styles.heroCopy}>
        <h1 id="home-title">Получайте больше</h1>
        <p className={styles.heroText}>
          Пополняйте Steam, покупайте игровые скины и цифровые товары в одном аккаунте.
        </p>
        <div className={styles.heroActions}>
          <LockerButton className={styles.heroButton} href={APP_ROUTES.catalog}>
            Открыть каталог
          </LockerButton>
        </div>
      </div>
      <HeroProductCube />
    </section>
  );
}

const purchaseSteps = [
  "Выберите товар",
  "Пополните баланс",
  "Подтвердите покупку",
  "Получите товар",
];

const orderStatuses = [
  "Заказ создан",
  "Передан поставщику",
  "В обработке",
  "Получен",
  "Ошибка / требуется действие",
];

const steamSteps = [
  "Товар требует Steam",
  "Система просит данные",
  "Данные проверяются",
  "Товар передаётся",
];

const faqItems = [
  {
    answer: "Это счёт внутри Locker. Сначала вы пополняете баланс, затем оплачиваете покупки с него.",
    question: "Что такое внутренний баланс?",
  },
  {
    answer: "После оплаты система передаёт заказ поставщику. Если выдача автоматическая, товар приходит после обработки заказа.",
    question: "Когда приходит товар?",
  },
  {
    answer: "Для игровых предметов могут понадобиться данные Steam. Если они нужны, мы покажем это до оплаты.",
    question: "Что нужно для покупки скина?",
  },
  {
    answer: "Заказ получит отдельный статус. Пользователь увидит, что произошло и какое действие требуется дальше.",
    question: "Что будет, если товар не получится выдать?",
  },
  {
    answer: "Все приобретённые товары отображаются в профиле пользователя.",
    question: "Где посмотреть покупки?",
  },
];

function PurchaseScenario() {
  return (
    <section className={styles.purchaseScenario} id="purchase" aria-labelledby="purchase-title">
      <div className={styles.sectionCopy}>
        <span>Сценарий покупки</span>
        <h2 id="purchase-title">От выбора до получения — несколько шагов</h2>
        <p>
          Выберите товар, пополните баланс и получите покупку автоматически. Если для товара нужны данные Steam,
          мы предупредим заранее.
        </p>
      </div>

      <div className={styles.purchaseFlow} aria-label="Процесс покупки">
        <div className={styles.flowRail} aria-hidden="true" />
        <ol>
          {purchaseSteps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function OrderStatusFlow() {
  return (
    <section className={styles.orderStatus} id="order-status" aria-labelledby="status-title">
      <div className={styles.statusIntro}>
        <span>После оплаты</span>
        <h2 id="status-title">После оплаты заказ не исчезает</h2>
        <p>
          Покупка проходит через понятные статусы: создана, передана поставщику, выполнена или требует действия.
        </p>
      </div>

      <div className={styles.statusBoard} aria-label="Статусы заказа">
        {orderStatuses.map((status, index) => (
          <div className={styles.statusNode} data-critical={index === orderStatuses.length - 1 || undefined} key={status}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{status}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function SteamRequirements() {
  return (
    <section className={styles.steamRequirements} aria-labelledby="steam-title">
      <div className={styles.steamPanel}>
        <span>Игровые предметы</span>
        <h2 id="steam-title">Steam нужен только для игровых предметов</h2>
        <p>
          Если скин требует Steam ID, Trade URL или вход через Steam, мы покажем это до оплаты.
        </p>
      </div>

      <ol className={styles.steamSteps} aria-label="Steam-процесс">
        {steamSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}

function Faq() {
  return (
    <section className={styles.faqSection} id="faq" aria-labelledby="faq-title">
      <div className={styles.faqHeader}>
        <span>Вопросы</span>
        <h2 id="faq-title">Остались вопросы?</h2>
      </div>
      <div className={styles.faqList}>
        {faqItems.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBrand}>
        <p>Locker</p>
        <span>Юридическая информация будет добавлена после подтверждения реквизитов.</span>
      </div>
      <div className={styles.footerLinks}>
        <Link href={APP_ROUTES.catalog}>Каталог</Link>
        <Link href={APP_ROUTES.profile}>Профиль</Link>
        <Link href={APP_ROUTES.balance}>Баланс</Link>
        <Link href={APP_ROUTES.faq}>Вопросы</Link>
        <Link href={APP_ROUTES.contacts}>Контакты</Link>
        <Link href={APP_ROUTES.userAgreement}>Пользовательское соглашение</Link>
        <Link href={APP_ROUTES.privacy}>Политика конфиденциальности</Link>
        <Link href={APP_ROUTES.cookies}>Политика Cookie</Link>
      </div>
    </footer>
  );
}

export function HomePage() {
  return (
    <div className={styles.page}>
      <HashScrollRestorer />
      <Header />
      <main>
        <Hero />
        <ProductCarousel />
        <PurchaseScenario />
        <OrderStatusFlow />
        <SteamRequirements />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
