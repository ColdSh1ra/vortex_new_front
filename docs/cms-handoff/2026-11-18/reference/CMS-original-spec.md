# ТЗ для фронтенду сайту Vortex: підключення до CMS

CMS уже зроблена: бекенд на PHP (director-server), адмін-панель — у Vortex Director. Тепер контент сайту редагується там,
а сайт має **отримувати його з API CMS** замість `server/data/vortex.json`, статичних перекладів і даних у коді.

Цей документ описує, що змінюється для React/Node-частини. Блог працює за вже погодженим контрактом `blog-api-sashko.md` — він не змінився.

---

## 1. Підключення

Публічний API CMS: `https://site-api.<домен>/api` (точну адресу уточнити в бекенду).
Тільки `GET`, без авторизації, без cookies, відповіді — `application/json; charset=utf-8` зі справжнім HTTP-статусом.

```dotenv
# Node-сервер сайту
CMS_API_BASE_URL=https://site-api.<домен>/api
BLOG_API_BASE_URL=https://site-api.<домен>/api
BLOG_DEMO_MODE=false

# збірка клієнта
VITE_BLOG_DEMO_MODE=false
```

| Метод | Що повертає |
|---|---|
| `GET /content` | опублікований контент усіх 5 мов (формат як у `vortex.json` + нові ключі, див. розділ 4) |
| `GET /content/preview?token=…` | чернетки для попереднього перегляду (той самий формат) |
| `GET /content/media` | метадані файлів медіатеки (розміри, WebP, мініатюри) |
| `GET /blog/posts`, `/blog/posts/{slug}`, `/blog/sitemap` | без змін, за `blog-api-sashko.md` |
| `GET /blog/redirects/{slug}` | нова адреса статті після зміни slug |
| `GET /blog/preview/{id}?token=…` | чернетка статті |

Помилки: `{"code": "..."}` — `404 NOT_FOUND`, `403 PREVIEW_FORBIDDEN`, `503 CONTENT_UNAVAILABLE` (з `Retry-After: 60`),
для блогу — коди з контракту блогу.

---

## 2. Отримання контенту (замість `vortex.json`)

1. Node-сервер бере контент з `GET ${CMS_API_BASE_URL}/content` і віддає його і SSR, і React (через поточний `GET /api/content`
   або вбудовуючи в HTML) — **одне джерело для сервера й клієнта**.
2. Відповідь має заголовки `ETag` і `X-Content-Revision`. Рекомендовано тримати копію в пам'яті Node і перевіряти запитом з
   `If-None-Match` (відповідь `304`, якщо нічого не змінилося) — наприклад, не частіше ніж раз на 10–30 секунд.
   Після публікації в CMS зміни мають з'являтися **без збірки, перезапуску та копіювання файлів**.
3. Якщо CMS тимчасово недоступна (`503`/мережа) — віддавати останню успішно отриману копію; якщо її немає — відповідати 503,
   а не порожнім контентом.
4. **Прибрати `POST /api/content`** — зараз він без авторизації перезаписує весь файл. Запис тепер лише через CMS.
   Файл `server/data/vortex.json` більше не є джерелом даних (можна лишити як аварійний резерв лише для читання).
5. Ключі мов без змін: `ua`, `cz`, `sk`, `en`, `pl` (у HTML/SEO, як і раніше, `uk`, `cs`, …).

---

## 3. Обов'язкові зміни поведінки

| # | Що зробити |
|---|---|
| 1 | **Тексти з CMS мають пріоритет над `client/src/locales`.** Зараз локалі перекривають `ui` — має бути навпаки (локалі — лише запасний варіант, або прибрати їх зовсім після перенесення текстів у CMS). |
| 2 | Секції мають поле `visible` (`false` — не показувати секцію). **Приховані елементи списків сервер прибирає сам** — у масивах приходять лише видимі. |
| 3 | `homepage.why_vortex_section.cards[].image_src` — показувати картинку (зараз компонент її ігнорує). |
| 4 | Сторінка `/websites` має брати зображення з `homepage.website_development_section.website_image_src` (зараз підставляється інше джерело). |
| 5 | Валюта калькулятора — з `settings.pricing_calculator.currency` в усіх місцях (без символу валюти в коді). Формулу не змінювати. |
| 6 | Контакти: якщо посилання месенджера порожнє — кнопку не показувати. Формати: `https://…`, `viber://chat?number=…`, `mailto:…`. |
| 7 | Документи СТО: `href: null` — назва без посилання (не підставляти `#`). Необов'язкові поля блоків (`list_intro`, `items`, `closing_paragraphs`, `documents`, `note`) відсутні, якщо порожні. Кількість блоків довільна. |
| 8 | Масиви будь-якої довжини: верстка не повинна покладатися на фіксовану кількість карток/фото/постачальників/відгуків. |
| 9 | Зображення: нові файли приходять **абсолютними URL** зі сховища CMS (`https://…/cms-media/…`); старі шляхи `/imgs/...` лишаються відносними — статику `/imgs` поки не прибирати. |
| 10 | Галерея прикладів сайтів — з `websites.gallery`; **прибрати пошук файлів під час збірки** (`import.meta.glob` тощо). |
| 11 | Тарифи сайтів — з `websites.pricing` (див. нижче); у заявку передавати `tariffs[].id`. Серверну перевірку пакета й ціни робити за цими даними. |
| 12 | SEO (title, description, og:image, robots) — із `seo.<сторінка>` і в серверному HTML, і на клієнті. |

---

## 4. Нові ключі в `content[lang]`

Усі старі ключі `vortex.json` збережені з тим самим форматом (`homepage`, `FAQ`, `videos`, `contacts`, `settings`, `stats`, `ui`, `car_service`).
Нижче — що додано. Порожні рядки/масиви означають «не заповнено».

**Формат «цілі переходу»** (`*_target`, `link_target`, пункти меню): `/маршрут`, `#якір-секції`, `form:trial`, `form:demo`, `https://…`, `mailto:…`, `tel:…`.

### Головна

```ts
homepage.hero: {
  cta_text: string; cta_target: string;           // кнопка першого екрана
  image: string; image_alt: string;
  screenshots: { image: string; alt: string }[];  // скриншоти, які зараз у коді
}
// visible: boolean — у секціях:
// about_us_block, hero_page_slider_section, why_vortex_section, why_vortex_showcase_section,
// vortex_audience_section, client_testimonials_section, integrations_catalog_section,
// suppliers_section, sync_section, car_service_section, website_development_section

homepage.vortex_audience_section.cards[].cta_target: string

homepage.suppliers_section: {                     // карта постачальників
  visible: boolean; title: string; description: string;
  image: string; image_alt: string;               // ілюстрація
  suppliers: { id: string; name: string; logo: string; logo_alt: string }[];
}

homepage.sync_section: {                          // Vortex Sync
  visible: boolean; title: string;
  paragraphs: string[];                           // замість sync.first…fourth (кількість довільна)
  client_label: string;                           // містить {number}
  image: string; image_alt: string;
}

homepage.car_service_section += {                 // додатково до heading/description/car_service_features
  visible: boolean;
  paragraphs: string[];                           // замість carOverview.first…third
  link_text: string; link_target: string;
  image: string; image_alt: string;
}

homepage.website_development_section += {
  visible: boolean; website_image_alt: string; cta_target: string;
}
// benefit_groups[].note відсутнє, якщо порожнє
```

> Для сумісності сервер **також** записує старі ключі `ui`: `nav.*`, `supplier.*`, `network.*`, `sync.*`, `carOverview.*`,
> `website.alt`, `common.privacy`, `common.tryFree`, `common.tryDemo`. Поточні компоненти не зламаються, але переходити варто
> на нові структури (вони підтримують довільну кількість елементів, зображення й порядок).

### Шапка, меню, футер

```ts
layout: {
  header_logo: string; header_logo_alt: string;
  footer_logo: string; footer_logo_alt: string;
  menu: { id: string; label: string; target: string }[];  // порядок і видимість задає CMS
  buttons: { try_free_text: string; try_free_target: string; try_demo_text: string; try_demo_target: string };
  socials: { network: 'facebook'|'instagram'|'youtube'|'telegram'|'tiktok'|'linkedin'|'x'|'other'; url: string; label: string }[];
  privacy_text: string; privacy_link: string;
  partner_images: { image: string; alt: string; url: string }[];
}
```

### Сторінка «Автошрот» (зараз — у локалях і компоненті)

```ts
autoshrot: {
  hero:       { visible; eyebrow; title; slogan; intro; cta_text; cta_target; image; image_alt };
  navigation: { visible; items: { label: string; target: 'hero'|'car'|'statuses'|'removal'|'workflow' }[] };
  car:        { visible; title; description; image; image_alt; characteristics: string[];
                benefits: { title: string; description: string }[] };
  statuses:   { visible; title; description; items: { name: string; card_title: string; card_description: string }[] };
  removal:    { visible; title; description; image; image_alt; methods: { title: string; description: string }[] };
  workflow:   { visible; title; steps: string[]; note: string };
}
```
`navigation.items[].target` — ID секції сторінки; якорі на сторінці мають бути саме `hero`, `car`, `statuses`, `removal`, `workflow`.

### Сторінка ліцензії TecDoc

```ts
tecdoc: {
  visible: boolean;
  hero: { eyebrow; title; subtitle; image; image_alt; cta_text; cta_target };
  stats: { value: number; suffix: string; label: string }[];
  sections: { id: string; title; description; items: string[]; image; image_alt; button_text; button_target }[];
  cta: { title; text; button_text; button_target };
}
```

### Сайти Vortex

```ts
websites.gallery: {
  visible: boolean;
  items: { id: string; image: string; title: string; alt: string; template: string; url: string }[];
}

websites.pricing: {
  visible: boolean; section_title: string;
  tariffs: {
    id: string;                 // free | practical | maximum | … — це значення йде в заявку
    name: string; price: number; currency: string;
    billing_type: 'free'|'monthly'|'one_time';
    extra_payments_note: string; cta_text: string;
  }[];
  services: {
    id: string; text: string;
    plans: { [tariffId: string]: { included: boolean; note: string } };  // явний склад пакета
  }[];
}
```
Включення послуги в тариф визначає **лише** `services[].plans[tariff.id].included`, а не позиція в масиві.

### Блог і SEO

```ts
blog_copy: { title: string; intro: string; texts: { [key: string]: string } };  // тексти з blog/copy.ts

seo: {
  home; faq; contacts; tecdoc; autoshrot; car_service; websites; blog: {
    title: string; description: string;
    share_image: string; share_image_alt: string;   // Open Graph / Twitter
    indexing: 'index' | 'noindex';
  }
}
```
Canonical, hreflang і JSON-LD, як і раніше, формує сайт із цих полів.

### Без змін
- `FAQ[].answer` — HTML; сервер очищає його до: `p, br, strong, b, em, i, u, s, a[href,target,rel], ul, ol, li, h3, h4, blockquote`
  (+ класи `ql-align-*`, `ql-indent-*`).
- `videos[].answer` — той самий HTML відеокарток (`faq-video-grid` / `faq-video-link`), формується з полів CMS.
- `stats` — `{ totalClicks: number; formSubmissions: number }`.

---

## 5. Медіа

- `GET /content/media` → `{ data: { "<url>": { width, height, mime, size, alt: {ua,…}, variants: [{ role: 'webp'|'thumb'|'original', url, width, height, mime }] } } }`.
  Можна використати для `width/height` (CLS) і `<picture>` з WebP.
- Завантажені файли мають унікальні URL (кожна заміна = новий URL) і кешуються браузером надовго.
- SVG з CMS уже очищені; вставляти їх як `<img>`, не інлайном.

---

## 6. Попередній перегляд чернеток

Адмін відкриває сайт за посиланням `https://<сайт>/?cms_preview=<token>` (для інших мов додається `&lang=en`).

- Якщо в URL є `cms_preview` — брати контент з `GET /content/preview?token=<token>` (не з кешу), передавати токен під час навігації
  сторінками, ставити `<meta name="robots" content="noindex, nofollow">` і не кешувати відповідь.
- Чернетка статті: `GET /blog/preview/{id}?token=<token>`.
- Токен діє годину; при `403 PREVIEW_FORBIDDEN` показати повідомлення «посилання попереднього перегляду застаріло».

---

## 7. Блог

- Підключити робочий API (див. env вище), **вимкнути деморежим обома параметрами**.
- Заголовок, вступ і допоміжні тексти — з `blog_copy` замість `blog/copy.ts`.
- Після зміни slug стара адреса повертає `404`. Щоб віддати `301`: на 404 статті запитати `GET /blog/redirects/{старий-slug}` →
  `{ data: { from, to } }` → редирект на `/blog/{to}` (зберігаючи `?lang=`).

---

## 8. Що потрібно від тебе (контент, який зараз у коді сайту)

Щоб перенести в CMS без втрат, надішли нам (JSON або просто файли) або внеси через адмінку:

1. Тексти з `client/src/locales`, які використовуються на сайті і яких немає в `ui` (з усіма 5 мовами).
2. Контент автошроту з локалей і зображення з компонента.
3. Тарифи сайтів: назви, валюта, тип оплати, пояснення, тексти кнопок; **повний перелік 27 послуг з перекладами** і склад кожного пакета.
4. Галерею прикладів сайтів (файли й назви/типи шаблонів).
5. Контент сторінки TecDoc.
6. Скриншоти першого екрана, логотипи, ілюстрації постачальників/Sync/СТО, партнерські зображення.
7. Тексти з `blog/copy.ts` (ключі залиш як є — вони стануть ключами `blog_copy.texts`).
8. **Реальні маршрути/якорі** для пунктів меню «Облік СТО», «Ціни», «FAQ», «Контакти» і назви форм (`form:trial`, `form:demo` — підтвердь).

Експорт поточного контенту CMS у форматі `vortex.json` можна отримати в адмінці (Інструменти → Експорт) — зручно як приклад даних для розробки.

---

## 9. Приймання

1. Сайт не читає `vortex.json`; `POST /api/content` видалено.
2. Зміни, опубліковані в CMS, видно при наступному завантаженні сторінки (SSR і клієнт однакові) без збірки й перезапуску.
3. Тексти CMS не перекриваються локалями.
4. `visible: false` приховує секцію; змінена кількість елементів у будь-якому списку не ламає верстку.
5. Працюють: картинки карток «Що вміє Vortex», зображення на `/websites`, галерея без збірки, тарифи з явним складом, вибраний тариф у заявці.
6. Калькулятор використовує ціни, періоди, початкові кількості й валюту з CMS.
7. FAQ, відеокартки, контакти, PDF-документи СТО працюють як раніше.
8. SEO-поля з CMS є в серверному HTML; `noindex` для чернеток і сторінок з `indexing: 'noindex'`.
9. Блог: реальні статті, пагінація, переклади, sitemap; 301 зі старого slug; деморежим вимкнено.
10. Попередній перегляд чернеток працює за токеном і закритий від індексації.
