# Відповідь CMS (PHP) на «Уточнення до API CMS» · 18.11.2026

Відповідь на пакет `vortex-cms-handoff-2026-11-18` (`API-уточнення.md`). Нумерація розділів у дужках відповідає вашому документу.

## 0. Коротко

- Пакет прийнято. Ваш `content.json` імпортується в CMS **без втрат у всіх п'яти мовах**: прогін «імпорт → публічний JSON → порівняння
  кожного поля» дає 0 розбіжностей і 0 конфліктів спільних значень між мовами. Свідомі винятки — у §2.10.
- **Усі запропоновані доповнення схеми підтримано** у вашому форматі JSON (§2), з кількома уточненнями.
- Реальний імпорт на test і fixtures відповідей — після того, як запрацює хост test API (§1). Цей документ описує фактичну
  поведінку коду CMS, а не знімок живого сервера.

## 1. Адреси API (P0)

| Середовище | `CMS_API_BASE_URL` / `BLOG_API_BASE_URL` |
|---|---|
| test | `http://site-api.dev.vortex-services.com/api` |
| production | `https://site-api.director.vortex-services.com/api` |

- Корінь без кінцевого `/blog`. Публічні методи — лише `GET` (і `HEAD`), без cookies і без авторизації, доступні з Node-сервера.
- Production — HTTPS, test — HTTP.
- Стан test: хост `site-api.dev…` ще не налаштований на рівні вебсервера (повертає HTML 404 від Apache, а не JSON API).
  Повідомимо, щойно запрацює; тоді ж імпортуємо ваш `content.json` і надішлемо реальні відповіді.

## 2. Схема: що підтримано (P0, розділи 3–7)

Шляхи — відносно `content[lang]`. Повний перелік полів і їхньої мовності — у файлі `field-mapping.md`, що додається до цієї відповіді.

### 2.1. `integration_pages` і `seo.integrations[slug]` — так

- Формат як у вашому експорті: спільні підписи (`visible`, `label`, `eyebrow`, `connect`, `viewFeatures`, `featuresTitle`, `linksTitle`,
  `back`, `relatedTitle`) + `pages[slug]`.
- Сторінка: `slug`, `path`, `visible`, `title`, `lead`, `logo`, `logo_alt`, `sections[]`, `gallery[]`, `links[]`.
  `path` CMS обчислює сама: завжди `/integrations/{slug}`. Регістр slug зберігається (`turboSMS`, `bank_API`).
- **Нове — стабільні ID** (ваше прохання з розділу 4):
  - `sections[].id` і `gallery[].id` — не змінюються при перестановці в CMS;
  - для вашого файлу вони згенеровані за позицією: `section-1…`, `image-1…`, однакові в усіх мовах.
  Зв'язок «розділ → ілюстрація» — поле `sections[].image` того самого розділу; галерея — окремий список після розділів.
  Розділ без ілюстрації має `image: ""`.
- `links[]: {label, href}` і `homepage.integrations_catalog_section.cards[].partner_links[]` зберігають URL дослівно, з `utm_source` /
  `registration_code`. Ключа `partner_links` немає у картках без пропозицій.
- SEO кожної сторінки редагується разом зі сторінкою, а публікується в `seo.integrations[slug]`. Тип той самий, що й в інших SEO-ключах:
  `{title, description, share_image, share_image_alt, indexing}`.

### 2.2. `privacy_policy` і `seo.privacy_policy` — так

- Поля: `visible`, `eyebrow`, `title`, `lead`, `updated`, `contents`, `updated_at`, `sections[]: {id, title, html}`.
- `updated_at` — машинна дата `РРРР-ММ-ДД`, перевіряється при збереженні. Змінюється лише вручну, не з датою публікації.
- HTML усіх 14 розділів проходить очищення без змін: `<code>`, посилання з `target`/`rel`, `mailto:` (перевірено на вашому файлі).

### 2.3. `homepage.vortex_pricing_section` — так

- Поля: `visible`, `section_title`, `section_description`, `billing_labels {monthly, yearly, one_time}`.
- `plans[]: {id, name, description, price, currency, billing_period, features[], cta_text, cta_target, highlighted}`.
- `price` — число або `null`; `null` означає «сума не показується».
- Після імпорту: `visible: false`, `plans: []` у всіх мовах. Розділ редагує й публікує лише адміністратор.

### 2.4. `layout` — так

- `header_menu[]: {id, label, target?, children?}`:
  - у групи (`services`) немає ключа `target`;
  - у пункту без підпунктів немає ключа `children`;
  - **глибина — один рівень вкладеності.**
- `footer_menu[]` — у власному порядку. Плоский `menu[]` лишається для сумісності (не показувати разом із `header_menu`).
- `socials[].icon`. `partner_images[].url` — ціль переходу (маршрут сайту на кшталт `/tecdoc-license` або `https://…`), не лише https.
- Приховані пункти (`visible: false`) CMS прибирає з видачі сама.

### 2.5. `tecdoc` — так

- `license {visible, eyebrow, price, currency, billing_type, price_period, payment_terms, trial_terms, trial_badge}`.
- `hero.secondary_cta_text`, `hero.secondary_cta_target`, `hero.details[]`.
- `sections[].eyebrow` і `sections[].blocks[]: {id, title, paragraphs[]}`. Обидва ключі опускаються, якщо порожні.

### 2.6. Автошрот — так

- `navigation.label`, `car|statuses|removal.eyebrow`.
- `anchor_aliases` у вашому форматі (`dismantling-vehicle → car` тощо). Редагує лише адміністратор.

### 2.7. Сайти — так

- `websites.gallery.section_title` і `websites.pricing.section_description`.
- `gallery.items[].template` тепер перекладний: у вашому експорті він різний для різних мов.
- `services[].plans[tariffId] = {included, note, text?}` — явна матриця 27 × 3.
  `text` — окреме формулювання послуги для тарифу (`vehicleCatalog`, `mscore`). Ключа немає, якщо окремого тексту немає.

### 2.8. Цілі переходу і форма заявки (розділ 3)

- Кнопки trial і demo ведуть на **`#trial-request` — одна форма**, окремого поля наміру (`intent`) не додаємо.
  `form:trial` / `form:demo` не використовуються.
- Дозволені цілі: `/маршрут` (з `?…` і `#…`), `#якір`, `https://…`, `mailto:`, `tel:`. Довільний JavaScript неможливий.

### 2.9. Сумісні ключі `ui`

CMS і далі записує старі ключі `ui`, які читає сайт:

- `nav.*` — з ID пунктів меню: `car-service` → `nav.carService`, `autoshrot` → `nav.dismantling`, група `services` → `nav.services`;
- `network.*`, `sync.*`, `carOverview.*`, `website.alt`, `common.privacy`, `common.tryFree`, `common.tryDemo`.

Якщо для ключа є значення в CMS, локалі не повинні його перекривати.

### 2.10. Чого свідомо немає

- `homepage.why_vortex_showcase_section` — у CMS немає розділу, у публічному JSON ключа немає.
- Старі `ui['supplier.technomir' | 'supplier.uniq' | 'supplier.groupauto']` замінено на `ui['supplier.<id>']` з вашого списку
  (`supplier.supplier-1…15`). За `raw-source` сайт ці ключі не читає; джерело — `homepage.suppliers_section.suppliers[]`.

## 3. Рішення щодо відкритих питань (P0/P1)

| Питання | Рішення |
|---|---|
| Приховування сторінки | `visible: false` **сторінки** (інтеграція, політика, TecDoc) → сайт віддає 404, прибирає її з меню, sitemap і `llms`. Сторінка лишається в JSON з `visible: false`. `visible: false` **секції** лише ховає секцію, сторінка доступна. |
| Preview (розділ 8) | **Погоджуємо** ваш безпечніший варіант: Node обмінює `?cms_preview=<token>` на коротку HttpOnly preview-сесію і прибирає токен з адреси. З боку CMS змін не потрібно. Параметри токена — §4.2. |
| Додаткова оплата сайтів | Лишається **текстовою приміткою** `extra_payments_note`. Окремих полів суми/періоду немає, `billing_type` платних тарифів — `one_time`. |
| TecDoc: річна передоплата, trial | Лишаються **текстом** (`payment_terms`, `trial_terms`, `trial_badge`). Машинні поля — лише `price`, `currency`, `billing_type`. |
| Глибина меню | Один рівень `children`. |
| Порожні значення | §3.1. |
| Атомарність | Одна ревізія для всіх п'яти мов. Публікація кількох розділів — одна транзакція: або всі, або жоден. `X-Content-Revision` — ціле число, що зростає лише при публікації. |
| Неповна локалізація | Розділ не публікується з адмінки, якщо обов'язкове поле порожнє хоча б в одній із п'яти мов. Виняток — первинний імпорт файлу: він публікує дані як є (тому прогалини з вашого `export-report.json` після імпорту лишаться видимими, доки їх не виправлять). |
| `schemaVersion` | Поки немає. Якщо потрібен — напишіть, додамо. |

**Серверна перевірка тарифу в заявці (розділ 6.1).** CMS заявки не приймає. Пропонуємо, щоб перевіряв сервер, який приймає заявку
(за вашим описом — Node сайту), за тією самою опублікованою ревізією, яку він віддає:

- `website_package` має бути `id` видимого тарифу з `websites.pricing.tariffs[]`;
- ціну, валюту й тип оплати брати з ревізії, а не з клієнтського `total_sum`.

Якщо заявки приймає інший бекенд — напишіть, який, узгодимо окремо.

### 3.1. Семантика значень у видачі CMS

- CMS **завжди віддає всі поля схеми**. Ключ може бути відсутнім лише в необов'язкових полях, позначених у схемі як «опускати порожнє»:
  - `header_menu[].target` / `children`, `cards[].partner_links`, `plans[tariff].text`;
  - `tecdoc.sections[].eyebrow` / `blocks`;
  - блоки СТО: `list_intro`, `items`, `closing_paragraphs`, `documents`, `note`;
  - `website_development_section.benefit_groups[].note`.
  Відсутній ключ означає «не застосовується», а не «бери з локалі».
- `""` — порожнє значення. Порожнє посилання месенджера не створює кнопку, порожнє зображення — без зображення.
- `null` лише у двох місцях: `car_service.blocks[].documents[].href` (назва без посилання) і `vortex_pricing_section.plans[].price` (сума не показується).
- Числа й булеві значення — числа й булеві. Порожній список — `[]`, порожній об'єкт — `{}`.
- Приховані елементи списків (`visible: false`) CMS прибирає сама; прапорця `visible` в елементах списків у видачі немає.
  Винятки: сторінки інтеграцій (див. вище) і `visible` секцій.

## 4. Поведінка API (для ваших fixtures; розділи 2, 8, 9)

### 4.1. `GET /content`

| Випадок | Відповідь |
|---|---|
| Успіх | `200`, тіло `{ua, cz, sk, en, pl}` без обгортки; `Content-Type: application/json; charset=utf-8`; `ETag: "cms-<revision>"`; `X-Content-Revision: <revision>`; `Cache-Control: no-cache` |
| `If-None-Match` збігається | `304` без тіла (з тими самими `ETag` / `X-Content-Revision`) |
| БД/Redis недоступні, внутрішня помилка | `503 {"code":"CONTENT_UNAVAILABLE"}` + `Retry-After: 60` |
| Невідомий шлях | `404 {"code":"NOT_FOUND"}` |
| Не GET/HEAD | `405 {"code":"METHOD_NOT_ALLOWED"}` + `Allow` |

Кеш опублікованої ревізії — у Redis. Нова публікація змінює ревізію, тож `ETag` змінюється без перезапуску.

### 4.2. Preview: `GET /content/preview?token=…`

- Тіло — та сама схема з чернеток.
- Заголовки: `Cache-Control: no-store, private`, `X-Robots-Tag: noindex, nofollow, noarchive`. `ETag` немає.
- Недійсний або прострочений токен → `403 {"code":"PREVIEW_FORBIDDEN"}`.
- Токен: 48 hex-символів, строк дії **1 година** (налаштування `preview_ttl`). Створюється в адмінці кнопкою «Попередній перегляд».
- Адмінка відкриває `<site_url>/?cms_preview=<token>`.
- Область дії: один токен відкриває **всі чернетки** контенту і блогу, не прив'язаний до сторінки чи статті. Відкликання — лише закінченням строку.
- Публічний кеш preview-запити не зачіпають.

### 4.3. Медіа: `GET /content/media`

- Формат: `{data: {[url]: {id, mime, size, width, height, title, alt: {ua, cz, sk, en, pl}, variants: [{role, url, mime, width, height, size}]}}}`.
- `role` — `original` | `webp` | `thumb`; `Cache-Control: no-cache`.
- **Зараз видаються лише файли, завантажені через CMS.** Наявні `/imgs/…` CMS лише реєструє в медіатеці, без розмірів, і в цій відповіді
  їх немає. Плануємо заповнити їхні реальні розміри, mime й alt з вашого `media-manifest.json`.
- Кожне завантаження отримує новий URL, тому довгий кеш безпечний. Файл, який десь використовується, видалити неможливо.
- SVG очищується під час завантаження, не віддається inline.
- `/imgs/…` лишаються на сервері сайту, CMS їх не переносить.

### 4.4. Блог (розділ 9)

- Контракт `blog-api-sashko.md` без змін.
- **`GET /blog/redirects/{old-slug}`:**
  - є редирект → `200 {data: {from, to}}`, де `to` — **поточний slug** статті, не URL. Ланцюгів і циклів немає:
    старий slug прив'язаний до статті, а не до попереднього slug;
  - редиректу немає, або стаття знята з публікації чи ще не опублікована → `404 {"code":"BLOG_NOT_FOUND"}`;
  - тимчасова недоступність → `503 {"code":"BLOG_API_UNAVAILABLE"}` + `Retry-After: 60`, тож ці випадки розрізняються за статусом.
  - Мову (`?lang=…`) зберігає Node. `/blog/posts/{старий-slug}` дає 404 (тоді Node питає redirects); sitemap містить лише поточні slug.
    Canonical після перейменування формує сайт за поточним slug.
- **`GET /blog/preview/{id}?token=…`:**
  - відповідь — `{data: Post}` у тому самому форматі, що й `/blog/posts/{slug}`;
  - `id` — внутрішній ID статті з адмінки; токен той самий, що в §4.2;
  - частково перекладена чернетка повертається як є (порожні поля);
  - `403 PREVIEW_FORBIDDEN` / `404 BLOG_NOT_FOUND`.
  - Маршрут перегляду на сайті запропонуйте ви. Зараз адмінка показує попередній перегляд статті у себе й посилання на сайт не формує.

### 4.5. HTML (розділи 2, 5)

Один білий список для FAQ, відео й політики:

- теги: `p`, `br`, `strong`, `b`, `em`, `i`, `u`, `s`, `a[href, target=_blank, rel]`, `ul`, `ol`, `li`, `h3`, `h4`, `blockquote`, `span`, `div`, `code`;
- `class` — лише `faq-video-*` і `ql-(align|indent|size|direction)-*`;
- до `target=_blank` автоматично додається `rel="noopener noreferrer"`.

Скрипти, стилі й інші атрибути вирізаються. Сайту варто застосовувати той самий список.
Нюанс: редактор адмінки (Quill) при редагуванні розділу може додати `target="_blank"` посиланням, у яких його не було (наприклад, `mailto:`).

## 5. Контент і підтвердження (розділи 6, 7)

- **Галерея `/websites`:** три приклади без скриншотів. CMS не дасть опублікувати розділ, доки не будуть додані реальні файли
  (заглушки не ставимо). Якщо скриншоти є у вас — надішліть.
- **Lorem ipsum у відгуках** (40 значень) — редактура з нашого боку, до того часу перенесено як є.
- **Ціни, реферальні пропозиції, текст політики, пакети Vortex** — перенесено як знімок. Актуальність підтверджує власник окремо;
  пакети Vortex лишаються прихованими до його дозволу.

## 6. Що потрібно від вас

1. Підтвердити, що перевірку тарифу заявки робить Node, або вказати інший бекенд (§3).
2. Маршрут сайту для перегляду чернетки статті (§4.4).
3. Чи потрібен `schemaVersion` (§3).
4. Скриншоти прикладів сайтів, якщо вони є (§5).

Далі з нашого боку: запуск хоста test → імпорт вашого `content.json` → реальні відповіді `GET /content` (200/304/403/404/503 із заголовками)
→ метадані `/imgs/…` у `/content/media`.
