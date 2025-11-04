# it-challenge-backend

Express + Prisma + PostgreSQL backend s autentifikáciou, rolami, produktami, košíkom a objednávkami.

## Spojenie GIT a VSCode

(Očakávam že si logged in do GitHub účtu na VSCode. Ak nie, najdi youtube tutoriál, skill issue) 

1. Klikni Source Control (tretí tab od hora, v sidebar-e na ľavo)
2. Click "Initialise Repository"
3. Objaví sa "Changes". Hoverni na to, objavia sa 3 bodky napravo od toho. Remote -> Add Remote
4. Promptne ťa možno o link, možno o prijamy výber. Tam daj URL na toto repo (https://github.com/shiftyboi1/it-challenge-backend). Ak toto nefunguje, jeden z nás je debil.
5. Poprosí vas o name, MUSÍTE ho pomenovať "origin"
6. Si connected. Teraz, pod "Changes" nájdeš graph. **Najprv klikni FETCH, potom PULL. TOTO JE POVINNÉ. Ak toto nespravíš, dlžíš mi 10€**

## Setup projektu (Quickstart)

(Hádam, že máš installed Node (kvôli Node Package Manageri, teda NPM) (youtube tutorial) ako aj PostgreSQL)
ROB TOTO V SPRÁVNOM ADRESÁRY/PRIEČINKU.

1. Install dependencies:
```bash
npm install
```

2. Skopíruj `.env.example` do `.env` a nastav hodnoty (Uprav DATABASE_URL, JWT_SECRET atď.)
  - `CORS_ORIGIN` nastav na URL frontend-u (napr. `http://localhost:5173`) ak chceš obmedziť prístup.

3. Spusti migrácie (vytvorí tabuľky v DB):
```bash
npm run migrate -- --name init
# name je meno migracie (pochop ako "meno zmeny db". davam init lebo je to "initial")
```

4. Seed-ni admin usera a demo produkty (tvorí usera s admin rolou a vloží základné produkty):
```bash
npx prisma db seed
# Admin: admin@itchallenge.com / admin123
```

5. Start server (lokalne, na tvojom device):
```bash
npm run dev
```

## User role systém

Role sú case sensitive, teda musia byť presne takto napísané

- **USER** - štandardný user (default pri registrácii)
- **SPRAVCA** - môže vidieť všetky objednávky
- **ADMIN** - môže robiť všetko (user management, zmeniť role USER a SPRAVCA)

## API Endpointy

Pri každom je aj príklad requestu. "body" nie sú "points", je to body ako "telo" po anglicky.
Dáta, kt. sú v príkladoch, reálne vo fresh DB nebudú.
GET requesty z pravidla nemajú body.
Dávaj pozor, či ide o POST request, či GET request, či PATCH.

### Public (nechránené, netreba token)

**`POST /api/auth/login`** - Login (vráti token + user)
```json
{
  "email": "BasharAlAssad@hotmail.com",
  "password": "ihateamerica"
}
```

**`POST /api/users`** - Registrácia (automaticky rola USER)
```json
{
  "email": "milujemalkohol@nrsr.sk",
  "name": "Andrej Danko",
  "password": "nrsr123"
}
```

**`GET /api/users/exists?email=...`** - Skontroluj či email existuje (query param, nie body)

**`GET /api/products`** - Zoznam produktov (žiadne body)

**`GET /api/products/:id`** - Detail produktu

### Protected (vyžaduje token)

**`GET /api/me`** - Info o aktuálnom userovi z tokenu (nemá body)

Autorizácia: posielaj hlavičku

```
Authorization: Bearer <token>
```

### Admin only

**`GET /api/users?page=1&role=USER&email=search`** - List userov (pagination 20/strana, filter podľa role/emailu)
Query je v parametroch URL. (viď "page" "role" atď v samotnej URL).

**`PATCH /api/users/:id/role`** - Zmeň role usera (USER / SPRAVCA len, nemôže meniť adminov)
```json
{
  "role": "SPRAVCA"
}
```

### User routes (cart, atď.) (Tiež podľa tokenu)

**`GET /api/cart`** - Košík aktuálneho usera (žiadne body)

**`POST /api/cart/add`** - Pridaj kus produktu do košíka (alebo zvýš množstvo)
```json
{ "productId": 1 }
```

**`POST /api/cart/remove`** - Odober kus produktu z košíka
```json
{ "productId": 1 }
```

**`POST /api/cart/remove-all`** - Odstráň všetky kusy konkrétneho produktu z košíka
```json
{ "productId": 1 }
```

**`DELETE /api/cart`** - Vyprázdni košík

### User routes (orders)

**`POST /api/orders`** - Vytvor objednávku z košíka (tzv. checkout)
Automaticky vezme košík, vytvorí order a vyprázdni košík. (nemá body)

**`GET /api/orders/my`** - Tvoje objednávky (žiadne body)

**`GET /api/orders/:id`** - Detail konkrétnej objednávky (napr. /api/orders/5)
User vidí len svoje, admin/spravca môžu vidieť ľubovoľnú. (žiadne body)

### Spravca + Admin

**`GET /api/orders`** - Všetky objednávky (žiadne body)

**`PATCH /api/orders/:id/status`** - Zmeň status objednávky (napr. /api/orders/5/status)
```json
{
  "status": "FULFILLED"
}
```
Statusy môžu byť len: FULFILLED, CANCELLED, PROCESSING

## Poznamky

- Passwords sú hashované bcryptom (12 rounds)
- JWT tokeny obsahujú: `{ sub: userId, email, role }`
- Token posielaj v hlavičke `Authorization: Bearer <token>`
- Admin nemôže byť degradovaný inými adminmi
- Users nemôžu meniť vlastnú rolu
- Email search je case-insensitive partial match (proste si vyhladaj čo to znamená nebudem to rozpisovať)

## Integrácia s frontendom

- Frontend volá API s `VITE_API_URL` nastaveným na backend, napr. `http://localhost:3000/api`.
- Produkty: `GET /api/products` poskytuje zoznam produktov používaný v shop-e.
- Košík a objednávky vyžadujú prihlásenie. Frontend posiela `Authorization: Bearer <token>` po úspešnom logine.

