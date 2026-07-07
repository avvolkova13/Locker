import Link from "next/link";
import { AuthHeaderButton } from "@/components/shared/auth-header-button";
import { LockerButton } from "@/components/shared/locker-button";
import { APP_ROUTES } from "@/constants/routes";
import { FooterWord } from "./footer-word";
import { HashScrollRestorer } from "./hash-scroll-restorer";
import { HeroApeBackground } from "./hero-ape-background";
import { HeroProductCube } from "./hero-product-cube";
import { HomeSectionIndex } from "./home-section-index";
import { ProductCarousel } from "./product-carousel";
import { PurchaseScenario } from "./purchase-scenario";
import styles from "./home-page.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <Link className={styles.logo} href={APP_ROUTES.home} aria-label="Главная Locker">
        Locker
      </Link>
      <nav className={styles.nav} aria-label="Основная навигация">
        <Link href="#goods">Товары</Link>
        <Link href="#purchase">Покупка</Link>
        <Link href="#steam">Steam</Link>
        <Link href="#faq">FAQ</Link>
      </nav>
      <div className={styles.headerActions}>
        <AuthHeaderButton />
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className={styles.hero} id="hero" aria-labelledby="home-title">
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

const faqItems = [
  {
    answer: "Это счёт внутри Locker. Его можно пополнить картой или через СБП, а покупки списываются с баланса.",
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

function SteamRequirements() {
  return (
    <section className={styles.steamRequirements} id="steam" aria-labelledby="steam-title">
      <HeroApeBackground variant="steam" />
      <div className={styles.steamPanel}>
        <h2 id="steam-title">Steam понадобится только при покупке скинов</h2>
        <p>
          Пополнение Steam Wallet и большинство цифровых товаров не требуют дополнительной настройки. Для игровых
          предметов мы заранее подскажем, какие данные Steam понадобятся.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className={styles.faqSection} id="faq" aria-labelledby="faq-title">
      <div className={styles.faqHeader}>
        <h2 id="faq-title">FAQ</h2>
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
    <footer className={styles.footer} id="footer">
      <div className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <p>Locker</p>
          <span>Юридическая информация будет добавлена после подтверждения реквизитов.</span>
        </div>
        <div className={styles.footerLinks}>
          <div>
            <p>Locker</p>
            <Link href={APP_ROUTES.catalog}>Каталог</Link>
            <Link href={APP_ROUTES.profile}>Профиль</Link>
            <Link href={APP_ROUTES.balance}>Баланс</Link>
            <Link href={APP_ROUTES.purchaseHistory}>История покупок</Link>
          </div>
          <div>
            <p>Помощь</p>
            <Link href={APP_ROUTES.faq}>FAQ</Link>
            <Link href={APP_ROUTES.contacts}>Контакты</Link>
          </div>
          <div>
            <p>Документы</p>
            <Link href={APP_ROUTES.userAgreement}>Пользовательское соглашение</Link>
            <Link href={APP_ROUTES.privacy}>Политика конфиденциальности</Link>
            <Link href={APP_ROUTES.cookies}>Политика Cookie</Link>
          </div>
        </div>
      </div>
      <FooterWord />
    </footer>
  );
}

export function HomePage() {
  return (
    <div className={styles.page}>
      <HashScrollRestorer />
      <HomeSectionIndex />
      <Header />
      <main>
        <Hero />
        <ProductCarousel />
        <PurchaseScenario />
        <SteamRequirements />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
