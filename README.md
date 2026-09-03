# 🚛 TachoDrive — Truck Driver Logistics PWA

Мобільний веб-додаток (PWA) для дальнобійників з реєстрацією режимів тахографа, транзитів, кордонів і витрат.

## Стек технологій

| Компонент | Технологія |
|-----------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS (Dark Theme) |
| Icons | Lucide React |
| PWA | vite-plugin-pwa |
| State | Zustand |
| Backend | Express.js |
| ORM | Prisma |
| Database | MariaDB 11 |
| Deploy | Docker Compose |

## Швидкий запуск (Docker)

```bash
# Клонування та запуск
cd truck
docker compose up --build -d

# Відкрити у браузері
open http://localhost:3000
```

## Локальна розробка

### Вимоги
- Node.js 20+
- MariaDB або MySQL запущений локально

### Налаштування

```bash
# 1. Встановити залежності
npm install

# 2. Скопіювати .env.example
cp .env.example .env
# Відредагувати DATABASE_URL під ваш MariaDB

# 3. Застосувати схему БД
npm run db:push

# 4. Зробити seed (створити юзера з id=1)
npm run db:seed

# 5. Запустити dev сервери (Vite + Express паралельно)
npm run dev
```

Vite буде доступний на: http://localhost:5173
Express API — на: http://localhost:3001

## API Ендпоінти

| Метод | URL | Опис |
|-------|-----|------|
| POST | `/api/shifts/start` | Відкрити зміну |
| POST | `/api/shifts/close` | Закрити зміну |
| GET | `/api/shifts/active` | Поточна активна зміна |
| GET | `/api/shifts/current-report` | Повний звіт зміни |
| POST | `/api/tacho/toggle` | Перемкнути режим тахографа |
| PATCH | `/api/tacho/:id` | Виправити час початку |
| GET | `/api/tacho/current` | Поточний режим |
| POST | `/api/trip/event` | Зафіксувати подію їзди |
| GET | `/api/trip/:shiftId` | Список подій зміни |
| POST | `/api/expenses` | Додати витрату |
| GET | `/api/expenses/:shiftId` | Витрати зміни |

## Структура проекту

```
truck/
├── docker-compose.yml        # Docker Compose
├── Dockerfile                # Multi-stage build
├── package.json
├── vite.config.js
├── tailwind.config.js
├── prisma/
│   ├── schema.prisma         # DB schema
│   └── seed.js               # Seed default user
├── public/
│   ├── icons/                # PWA icons
│   └── manifest.webmanifest
├── src/
│   ├── client/               # React frontend
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── api/              # Axios + offline queue
│   │   ├── store/            # Zustand state
│   │   ├── components/       # Reusable UI
│   │   └── pages/            # 5 screens
│   └── server/               # Express backend
│       ├── index.js
│       ├── controllers/
│       └── routes/
└── index.html
```

## Функціонал

- ✅ **Відкриття/закриття зміни** з одометром, часом карти, мотогодинами рефрижератора
- ✅ **Тахограф** — перемикання між Молотками / Ліжечком / Їздою з автоматичним закриттям попереднього режиму
- ✅ **Редагування часу** — виправлення start_time якщо водій забув натиснути
- ✅ **Їзда** — транзит, кордони, завантаження, вигрузка з одометром
- ✅ **Витрати** — компанія/власні, 6 категорій, 4 валюти
- ✅ **Offline-First** — черга дій у localStorage, автосинхронізація при відновленні
- ✅ **PWA** — встановлення на смартфон, кешування оболонки

## Docker Compose

```yaml
# Запуск
docker compose up -d

# Перегляд логів
docker compose logs -f app

# Зупинка
docker compose down
```

База даних зберігається у `mariadb_data` Docker volume (персистентно).
