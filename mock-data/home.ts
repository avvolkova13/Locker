export const productBands = [
  {
    title: "Steam Wallet",
    note: "регион и способ получения",
    meta: "баланс",
  },
  {
    title: "Скины",
    note: "игра, цена, требования Steam",
    meta: "Steam",
  },
  {
    title: "Подписки",
    note: "план, срок, способ доступа",
    meta: "доступ",
  },
  {
    title: "Другие товары",
    note: "раздел появится после проверки",
    meta: "позже",
  },
];

export const heroCubeProducts = [
  {
    title: "Steam Wallet",
    category: "пополнение",
    price: "от 500 ₽",
    meta: "регион виден",
    status: "баланс",
    code: "SW",
    mark: "₽",
    accent: "#90f6d9",
  },
  {
    title: "CS2 скины",
    category: "скины",
    price: "от 240 ₽",
    meta: "Steam нужен",
    status: "инвентарь",
    code: "C2",
    mark: "CS2",
    accent: "#f26a2e",
  },
  {
    title: "Dota 2 скины",
    category: "скины",
    price: "от 180 ₽",
    meta: "игра указана",
    status: "предметы",
    code: "D2",
    mark: "D2",
    accent: "#b78cff",
  },
  {
    title: "Rust скины",
    category: "скины",
    price: "от 320 ₽",
    meta: "условия видны",
    status: "Steam",
    code: "RS",
    mark: "R",
    accent: "#ff9d5c",
  },
  {
    title: "ChatGPT",
    category: "подписка",
    price: "по запросу",
    meta: "срок и доступ",
    status: "аккаунт",
    code: "AI",
    mark: "GPT",
    accent: "#d7c8a4",
  },
  {
    title: "Discord Nitro",
    category: "подписка",
    price: "по запросу",
    meta: "срок указан",
    status: "доступ",
    code: "DN",
    mark: "N",
    accent: "#8ea1ff",
  },
  {
    title: "Spotify Premium",
    category: "подписка",
    price: "по запросу",
    meta: "план виден",
    status: "музыка",
    code: "SP",
    mark: "S",
    accent: "#69e68f",
  },
  {
    title: "YouTube Premium",
    category: "подписка",
    price: "по запросу",
    meta: "доступ и срок",
    status: "видео",
    code: "YT",
    mark: "YT",
    accent: "#ff635c",
  },
  {
    title: "Xbox Game Pass",
    category: "подписка",
    price: "по запросу",
    meta: "период указан",
    status: "игры",
    code: "XB",
    mark: "X",
    accent: "#8cf28f",
  },
  {
    title: "PlayStation карты",
    category: "карты",
    price: "по запросу",
    meta: "регион виден",
    status: "код",
    code: "PS",
    mark: "PS",
    accent: "#75a7ff",
  },
  {
    title: "Steam карты",
    category: "карты",
    price: "по запросу",
    meta: "номинал виден",
    status: "код",
    code: "SC",
    mark: "S",
    accent: "#74d8ff",
  },
];

export const statusFlow = [
  "Баланс доступен",
  "Условия видны",
  "Заказ оформлен",
  "Идет обработка",
  "Есть итог",
];

export const accountSignals = [
  {
    value: "0",
    label: "обещаний без статуса",
  },
  {
    value: "5",
    label: "состояний заказа",
  },
  {
    value: "1",
    label: "история покупок",
  },
];

export const marketContrasts = [
  {
    ordinary: "Ограничения всплывают поздно",
    locker: "Условия показаны заранее",
  },
  {
    ordinary: "Оплата ушла, статус неясен",
    locker: "Оплата и статус в одном месте",
  },
  {
    ordinary: "Вопрос без номера заказа",
    locker: "Поддержка получает контекст",
  },
];
