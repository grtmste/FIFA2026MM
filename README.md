# Jalka MM 2026 Ennustusmäng

FIFA Maailmameistrivõistluste 2026 ennustusmängu rakendus. Ehitatud Next.js 14
(App Router, TypeScript), Tailwind CSS ja Supabase (PostgreSQL) baasil.

## Funktsioonid

- **Edetabel (`/`)** — osalejate paremusjärjestus (mängu-, boonus- ja
  koondpunktid), uuendub elavalt Supabase Realtime kaudu.
- **Mängud (`/matches`)** — kõik 72 alagrupimängu (12 gruppi, A-L) ning
  väljalangemisfaasi (1/16, 1/8, veerandfinaal, poolfinaal, finaal) kohad,
  mille meeskonnad on veel "Selgub".
- **Boonusküsimused (`/boonusküsimused`)** — 7 lisaküsimust, osalejate
  vastused ja antud punktid.
- **Admin (`/admin`)** — salasõnaga kaitstud ala osalejate, ennustuste,
  tulemuste ja boonuspunktide haldamiseks.

## Punktiarvestus

- Täpne skoor → **3 punkti**
- Õige tulemus (võitja õigesti ennustatud, või mõlemad ennustasid viiki ja
  tulemus oli viik), kuid vale skoor → **1 punkt**
- Vale tulemus → **0 punkti**

## Tehnoloogiad

- [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (PostgreSQL, Realtime)
- [Vercel](https://vercel.com/) (hostimine)

## Kohalik seadistus

### 1. Sõltuvuste paigaldamine

```bash
npm install
```

### 2. Supabase projekti loomine

1. Looge uus projekt [Supabase](https://supabase.com/dashboard) keskkonnas.
2. Avage **SQL Editor** ja käivitage järjest:
   - `scripts/schema.sql` — loob tabelid, indeksid, RLS reeglid ja lubab
     realtime'i.
   - `scripts/seed.sql` — lisab kõik 72 alagrupimängu, väljalangemisfaasi
     "Selgub" placeholderid ning 7 boonusküsimust.
3. Kopeerige **Project Settings → API** alt:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` võti → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` võti → `SUPABASE_SERVICE_ROLE_KEY` (ainult serveris,
     kasutatakse admin tegevuste jaoks — ärge jagage seda kunagi avalikult)

### 3. Keskkonnamuutujad

Kopeerige `.env.example` failist `.env.local` ja täitke väärtused:

```bash
cp .env.example .env.local
```

| Muutuja | Kirjeldus |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase projekti URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase avalik (anon) võti |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role võti (ainult serverile, admin kirjutamiseks) |
| `ADMIN_PASSWORD` | Salasõna `/admin` ala kaitsmiseks |

### 4. Arenduskeskkonna käivitamine

```bash
npm run dev
```

Rakendus jookseb aadressil [http://localhost:3000](http://localhost:3000).

## Vercel'i deploy

1. Lükake see repo GitHubi.
2. Importige projekt [Vercel](https://vercel.com/new) keskkonda.
3. Lisage Vercel projekti **Environment Variables** alla sama 4 muutujat,
   mis `.env.local` failis (Production ja Preview keskkondadele).
4. Deploy. Vercel tuvastab automaatselt Next.js projekti.

## Andmebaasi struktuur

Vaata `scripts/schema.sql`:

- `participants` — osalejad (id, nimi)
- `matches` — mängud (alagrupp + väljalangemisfaas, koos staatusega
  `group | r32 | r16 | qf | sf | final`)
- `predictions` — osalejate ennustused mängude kohta
- `bonus_questions` — 7 boonusküsimust
- `bonus_answers` — osalejate vastused ja antud punktid

Kõik tabelid on avalikult loetavad (RLS `select` poliitika anon rollile).
Kirjutamine käib ainult admin serveri-tegevuste kaudu `service_role` võtmega,
mis möödub RLS-ist — anon võti ei saa andmeid muuta.

## Kausta struktuur

```
app/
  layout.tsx              # Põhilayout + alumine navigatsioon
  page.tsx                # Edetabel ("/")
  matches/page.tsx        # Mängude leht
  boonusküsimused/page.tsx
  admin/
    page.tsx              # Sisselogimine + admin dashboard
    AdminDashboard.tsx
    actions.ts            # Server actions (kirjutamine andmebaasi)
components/
  BottomNav.tsx
  MatchCard.tsx
lib/
  supabase.ts             # Avalik (anon) klient
  supabaseAdmin.ts         # Service role klient (server-only)
  scoring.ts              # Punktiarvestuse loogika
  types.ts
  auth.ts                 # Admin sessiooni kontroll
scripts/
  schema.sql
  seed.sql
```
