# Tattoo CRM

CRM-інструмент для тату-майстрів (клієнти, калькулятор вартості, портфоліо,
облік замовлень), доступ до якого надається покупцям закритого Telegram-курсу
після ручної перевірки оплати адміном.

Стек: Next.js (App Router) + Supabase (Postgres/Auth/Storage, RLS) + Tailwind CSS.

## Локальний запуск

1. Встановіть залежності:
   ```bash
   npm install
   ```
2. Підніміть Supabase локально (потрібен Docker):
   ```bash
   npx supabase start
   npx supabase db reset   # застосовує supabase/migrations/*.sql
   ```
3. Скопіюйте `.env.example` у `.env.local` і заповніть значеннями з
   `npx supabase status` (`API URL`, `anon key`, `service_role key`).
4. Створіть першого admin-акаунта (провіжинити майстрів нема кому, поки немає
   жодного admin):
   ```bash
   node scripts/create-first-admin.mjs admin@example.com "S3curePassword!" "Admin Name"
   ```
5. Запустіть застосунок:
   ```bash
   npm run dev
   ```
6. Увійдіть на `/login` під admin-акаунтом → `/admin` → надішліть запрошення
   майстру за email.

## Продакшн

Розгорніть на Vercel (або будь-де, де працює Next.js) + окремий хмарний
Supabase-проєкт. Env-змінні ті самі, що й у `.env.example`, значення — з
Project Settings → API у Supabase Dashboard. Не забудьте виставити
Site URL / Redirect URLs у Supabase Dashboard → Auth на реальний домен.

## Архітектура

- `supabase/migrations/` — схема БД, RLS-політики (ізоляція даних кожного
  майстра), приватний storage-бакет `portfolio`, тригер автостворення
  профілю при запрошенні нового майстра, тригер перехресної перевірки
  тенанта для `client_id` в замовленнях/розрахунках.
- `lib/supabase/{server,client,admin}.ts` — Supabase-клієнти для
  Server Components/Actions, браузера та service-role (лише сервер).
- `app/(admin)/admin` — надання доступу майстрам (тільки роль `admin`).
- `app/(app)/*` — сам CRM-інструмент (тільки роль `master`): огляд,
  клієнти, замовлення, калькулятор, портфоліо, налаштування.

## Тести RLS-ізоляції (pgTAP)

`supabase/tests/database/*.sql` — 43 pgTAP-тести, що перевіряють: майстер
бачить лише свої дані (clients/orders/calculations/portfolio_items/
master_settings/calculator_options), не може вставити чи змінити чужий
рядок, admin бачить усі профілі але не бізнес-дані майстрів, storage
ізольований по папках `{masterId}/...`.

Запуск без Docker/Supabase (проти звичайного локального Postgres з
розширенням pgtap):
```bash
sudo apt install postgresql-16-pgtap  # або відповідну версію
npm run test:db
```

Запуск проти вже піднятого `supabase start` (використовує його Postgres
на порту 54322):
```bash
npm run test:db:supabase
```
