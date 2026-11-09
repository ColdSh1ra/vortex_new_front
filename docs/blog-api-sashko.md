# ТЗ для Сашка: API блогу Vortex

## Технологія бекенду: PHP

API блогу буде реалізовано на **PHP**. Наведений нижче контракт — це HTTP + JSON; він не залежить від мови бекенду. Фрагменти TypeScript у цьому документі описують структуру даних, а не вимогу реалізувати API на Node.js чи TypeScript.

Розподіл відповідальності:

- **PHP API**: база статей, переклади, фільтр публічності, пагінація та дані для sitemap.
- **Наявний Node/Express-сервер сайту**: SSR React, серверні SEO-теги, проксі запитів до PHP та генерація XML sitemap.
- **React**: відображення статей, зміст, перемикання мови й пагінація.

PHP може працювати на іншому домені або на тому самому сервері. Важлива доступність PHP API з Node-сервера через HTTP(S). Окремий Node.js API для зберігання статей не потрібний; Node залишається частиною поточного SSR-сайту.

## Що вже реалізовано у фронтенді

- `/blog` — 16 статей на сторінку: 4 колонки × 4 ряди на десктопі; 2/1 колонки на менших екранах.
- `/blog/:slug` — стаття з H1, змістом-посиланнями та текстовими секціями H2.
- Пагінація: `/blog?page=2`; мовні версії: `/blog?lang=en`, `/blog/slug?lang=pl`. Українська — URL без `lang`.
- Один запит отримує усі 5 перекладів. Зміна мови не завантажує статтю повторно.
- SSR завантажує реальні дані до формування HTML: контент, title, description, canonical, hreflang, Open Graph, Twitter Card та JSON-LD уже є у відповіді сервера.
- Демодані існують лише до підключення API: 20 прикладів для перевірки двох сторінок. Статичний JSON повної статті розташований у `client/src/pages/BlogArticlePage.tsx` (`DEMO_BLOG_ARTICLE`). Усі демосторінки мають `noindex` та виключені з sitemap.
- Дані статті — звичайний текст; HTML, Markdown, скрипти та довільна розмітка не потрібні.

## Підключення

Production має працювати через наявний Node/Express SSR-сервер (`npm run build`, потім `npm run server:start`). Самого статичного хостингу `client/dist/client` недостатньо для серверних метатегів, HTTP 404/503 і динамічного sitemap. У dev-режимі Vite показує блог клієнтським рендерингом; SEO-HTML перевіряти через Node-сервер на порту 5001.

На Node-сервері встановити:

```dotenv
BLOG_API_BASE_URL=https://backend.example.com/api
BLOG_DEMO_MODE=false
```

На етапі збірки клієнта:

```dotenv
VITE_BLOG_DEMO_MODE=false
```

`BLOG_API_BASE_URL` має закінчуватися коренем API, **без** `/blog`. Поточний Node-сервер проксіює браузерні запити `/api/blog/...` у `${BLOG_API_BASE_URL}/blog/...`; SSR звертається до цього ж джерела без внутрішнього HTTP-запиту до себе. Зовнішній backend має бути доступним серверу і не повинен вимагати браузерних cookies. Публічні методи нижче — тільки GET, тіло запиту відсутнє, `Accept: application/json`. URL зовнішнього backend не потрібно передавати браузеру. Загальний `VITE_API_BASE_URL` залишити `/api`, якщо інші частини сайту працюють через поточний Node-сервер.

Коли API не налаштовано, локальний проксі повертає `503 {"code":"BLOG_API_NOT_CONFIGURED"}`. Тільки цей код дозволяє показ демо, якщо деморежим увімкнено. Справжній `404`, помилка мережі, некоректна відповідь або `500` **не підміняються** демонстраційним контентом.

## Особливості реалізації на PHP

### Маршрути та HTTP

Публічні URL залишаються такими самими:

```http
GET /api/blog/posts?page=1&limit=16
GET /api/blog/posts/inventory-control
GET /api/blog/sitemap?page=1&limit=1000
```

Якщо `BLOG_API_BASE_URL=https://backend.example.com/api`, Node звертатиметься саме до цих URL на `backend.example.com`. Реалізувати маршрути можна роутером PHP-фреймворку або через front controller `index.php` і rewrite у Nginx/Apache. Назви внутрішніх PHP-файлів не мають значення. Поточний frontend не використовує URL виду `posts.php`, `?action=getBlogs` чи POST для читання статей.

Відповідь має містити `Content-Type: application/json; charset=utf-8` і справжній HTTP-статус через `http_response_code(...)` або механізм фреймворку. Для невідомої статті — `404` із JSON, для збою — `500`/`503` із JSON. Не повертати сторінку входу, HTML-помилку чи PHP warning замість JSON. Деталі помилок логувати на сервері; не виводити їх у тіло відповіді.

У поточній схемі браузер звертається до API через той самий origin сайту, а Node — до PHP серверним запитом. Додатковий CORS-доступ до PHP для браузера не потрібний. Публічні GET-методи не повинні вимагати PHP-сесію, авторизацію адміністратора або CSRF-токен.

### Типи JSON

- `pagination.page`, `limit`, `total`, `totalPages`, `cover.width`, `cover.height` — **числа**, не рядки. Значення з PDO/БД за потреби явно привести до `int`.
- `id` статті — **рядок**, навіть якщо первинний ключ у БД числовий.
- `data` у списку та sitemap, `sections`, `paragraphs`, `availableLanguages` — JSON-масиви. Після фільтрації PHP-масивів застосовувати `array_values(...)`, щоб ключі `0, 2, 5` не перетворили результат на JSON-об’єкт.
- Порожній список — `"data": []`, не `{}` і не `null`.
- `translations`, `cover.alt`, `seo`, `author`, `pagination` — JSON-об’єкти. Асоціативний масив PHP з ключами мов підходить для `translations` і `cover.alt`.
- Не застосовувати `JSON_FORCE_OBJECT` або глобальний `JSON_NUMERIC_CHECK`: вони можуть порушити контракт масивів чи рядкових ID.
- JSON і база перекладів мають зберігати Unicode. `JSON_UNESCAPED_UNICODE` зручний для читання; звичайні JSON Unicode escape-послідовності також коректні. Не застосовувати `htmlspecialchars()` до тексту перед `json_encode()`: фронтенд уже безпечно відображає звичайний текст.

Приклад серіалізації відповіді списку у PHP (після отримання та підготовки `$posts`):

```php
$response = [
    'data' => array_values($posts),
    'pagination' => [
        'page' => (int) $page,
        'limit' => 16,
        'total' => (int) $total,
        'totalPages' => (int) ceil($total / 16),
    ],
];

$json = json_encode(
    $response,
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
);

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
echo $json;
```

Помилку серіалізації обробляє загальний обробник винятків API. Крім JSON у відповіді не повинно бути BOM, debug-виводу або попереджень PHP.

### Дати та отримання перекладів

`publishedAt` і `updatedAt` повертати в UTC, наприклад `2026-11-01T09:00:00Z`. Для `DateTimeImmutable` після приведення до UTC можна використати `format('Y-m-d\TH:i:s\Z')`. Не передавати SQL-рядок `2026-11-01 09:00:00`, Unix timestamp або локалізовану дату.

Спочатку отримати сторінку унікальних публікацій, а потім зібрати всі п’ять перекладів для цих ID. Не застосовувати LIMIT до результату JOIN, де кожен переклад утворює окремий рядок: це дасть менше ніж 16 статей і неправильний `total`. Кількість статей рахувати за унікальними публікаціями, а не рядками перекладів.

Ключі `ua`, `cz`, `sk`, `en`, `pl`, назви полів та структури відповідей нижче залишаються без змін.

## Мови та загальні типи

Ключі перекладів API: `ua`, `cz`, `sk`, `en`, `pl`.

Для HTML/hreflang фронтенд сам використовує відповідно `uk`, `cs`, `sk`, `en`, `pl`. Не замінювати ключі API на `uk`/`cs`.

```ts
type Language = 'ua' | 'cz' | 'sk' | 'en' | 'pl';
type LocalizedText = Record<Language, string>;

type SummaryTranslation = {
  title: string;                    // 1..300 символів
  excerpt: string;                  // 1..1500, рекомендовано 100–180
  seo: {
    title: string;                  // 1..300, рекомендовано до ~60
    description: string;            // 1..1500, рекомендовано ~140–160
  };
};

type PostSummary = {
  id: string;                       // стабільний ID, до 100 символів
  slug: string;                     // єдиний для 5 мов; до 160 символів
  cover: {
    url: string;                    // абсолютний HTTPS URL або шлях /imgs/...
    width: number;                  // фактичні додатні цілі розміри
    height: number;
    alt: LocalizedText;             // заповнено всіма мовами, до 500 символів
  };
  publishedAt: string;              // ISO 8601 UTC
  updatedAt: string;                // ISO 8601 UTC; >= publishedAt
  author: {
    name: string;                   // реальний автор / редакція, до 160 символів
    type: 'Person' | 'Organization';
  };
  translations: Record<Language, SummaryTranslation>;
};

type Section = {
  id: string;                       // унікальний у статті стабільний anchor
  heading: string;                  // H2, 1..300 символів
  paragraphs: string[];             // звичайний текст, не HTML
};
type ArticleTranslation = SummaryTranslation & { sections: Section[] };
type Post = Omit<PostSummary, 'translations'> & {
  translations: Record<Language, ArticleTranslation>;
};
```

Обов’язкові усі поля та всі п’ять мов. Стаття стає публічною лише після завершення всіх перекладів. Не повертати український текст замість відсутнього перекладу.

## 1. Список статей

```http
GET /api/blog/posts?page=1&limit=16
```

На зовнішньому backend шлях після API-кореня — `/blog/posts`.

Параметри:

| Поле | Тип | Правило |
| --- | --- | --- |
| `page` | integer | від 1, за замовчуванням 1 |
| `limit` | integer | 16; поточний frontend/проксі використовує рівно 16 |

Відповідь `200 application/json`:

```ts
{
  data: PostSummary[];
  pagination: {
    page: number;
    limit: 16;
    total: number;       // кількість усіх публічних статей, не перекладів
    totalPages: number;  // Math.ceil(total / 16)
  };
}
```

Наприклад, якщо опубліковано 20 статей:

- `page=1`: 16 елементів, `total=20`, `totalPages=2`;
- `page=2`: 4 елементи, `total=20`, `totalPages=2`;
- `page=3`: `404`;
- немає статей: `page=1`, `data=[]`, `total=0`, `totalPages=0`.

Сортування: `publishedAt DESC, id DESC`, стабільне та однакове для усіх мов. Кожна стаття має з’являтись один раз. Не передавати повні `sections` у списку. `total` має враховувати той самий фільтр публічності, що й `data`.

## 2. Повна стаття одразу всіма мовами

```http
GET /api/blog/posts/inventory-control
```

Відповідь:

```ts
{ data: Post }
```

Приклад однієї локалізації всередині `data.translations.ua`:

```json
{
  "title": "Як упорядкувати облік автозапчастин",
  "excerpt": "Практичні кроки для впорядкування даних і залишків.",
  "seo": {
    "title": "Облік автозапчастин | Блог Vortex",
    "description": "Підготовка даних, перевірка залишків та організація роботи команди магазину автозапчастин."
  },
  "sections": [
    {
      "id": "prepare-data",
      "heading": "Підготуйте дані про товари",
      "paragraphs": [
        "Почніть із назв, артикулів та виробників.",
        "Перегляньте дублікати перед інвентаризацією."
      ]
    },
    {
      "id": "check-stock",
      "heading": "Перевірте залишки",
      "paragraphs": ["Порівняйте облікові залишки з фактичною наявністю."]
    }
  ]
}
```

Крім `ua`, у тій самій відповіді **обов’язково** мають бути `cz`, `sk`, `en`, `pl` з такою самою структурою. Не потрібні п’ять окремих запитів чи параметр `lang`.

Вимоги:

- `slug` та `sections[].id`: лише латинські малі літери, цифри, дефіс; регулярний вираз `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- `slug` незмінний після публікації. Якщо його доведеться змінити, потрібен окремо погоджений механізм 301, не тихе повернення іншої статті за старим slug.
- ID секцій унікальні, однакові для відповідних підтем усіма мовами, до 100 символів. Зміна мови зберігає anchor.
- `sections`: 1..100 елементів; кожна секція має непорожні `paragraphs`, кожен абзац до 20 000 символів.
- Заголовки, текст і порядок секцій визначає API. Не передавати згенерований зміст: фронтенд будує його з `sections`.
- Дата публікації — реальна, не дата відкриття сторінки. `updatedAt` змінюється лише при змістовному оновленні.
- Повернення довільного HTML, вкладених script/iframe, JSON-LD або canonical URL не потрібне. Метатеги та мікророзмітку будує frontend/SSR із перевірених полів.
- Чернетка, прихована/видалена/неповністю перекладена стаття, майбутня публікація та невідомий slug повертають `404`, без її даних у відповіді.

## 3. Опубліковані URL для sitemap

```http
GET /api/blog/sitemap?page=1&limit=1000
```

Відповідь:

```json
{
  "data": [
    {
      "slug": "inventory-control",
      "updatedAt": "2026-11-01T09:00:00.000Z",
      "availableLanguages": ["ua", "cz", "sk", "en", "pl"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 1000,
    "total": 1,
    "totalPages": 1
  }
}
```

- Параметри `page >= 1`, `limit=1000`.
- `total` — та сама кількість опублікованих статей, що в методі списку.
- Одна стаття = один запис; усі 5 мов передаються в `availableLanguages`.
- Без назв, текстів та зображень, без чернеток і демонстраційних даних.
- Стабільне сортування як у списку. Для нульової кількості: порожній `data`, `total=0`, `totalPages=0`; перша сторінка відповідає `200`.
- Сервер сайту сам створює `/sitemap.xml` як індекс, `/sitemaps/pages.xml` зі сторінками сайту і пагінацією блогу, `/sitemaps/blog-N.xml` зі статтями відповідної порції. Кожна стаття дає 5 URL з взаємними hreflang та реальним lastmod.
- На порцію припадає до 5000 URL; це нижче межі 50 000. Для більш ніж 50 000 URL сторінок-пагінації або файлів sitemap потрібне додаткове розбиття; поточний сервер поверне `503`, а не обрізаний sitemap.
- Якщо backend тимчасово недоступний, sitemap відповідає `503` з `Retry-After: 60`, а не неправдивим порожнім списком статей.

## Помилки

```json
{ "code": "BLOG_NOT_FOUND" }
```

| HTTP | `code` | Значення |
| --- | --- | --- |
| 400 | `BLOG_INVALID_QUERY` | некоректна пагінація |
| 404 | `BLOG_NOT_FOUND` | немає публічної статті або сторінки |
| 500/503 | `BLOG_API_UNAVAILABLE` | серверна помилка / тимчасова недоступність |

Не повертати `200` із полем `error` чи HTML-сторінкою помилки. Не редиректити відсутню статтю на головну. Сайт повертає відповідний HTTP 404/503 для SSR-сторінки, показує повідомлення та ставить `noindex`.

## SEO та приймання інтеграції

1. Повний текст статті і SEO-теги доступні в HTML до виконання JavaScript.
2. П’ять URL однієї статті мають власний canonical, взаємні hreflang (`uk`, `cs`, `sk`, `en`, `pl`) та `x-default` на українську версію.
3. Кожна сторінка пагінації має власний canonical: друга не посилається canonical на першу.
4. Публічна стаття має BlogPosting і BreadcrumbList; список — CollectionPage/ItemList. Головна має Organization, WebSite, WebPage, SoftwareApplication.
5. Метадані BlogPosting: автор, фактичні дати, назва, опис, URL обкладинки з розмірами, мова, повний текст.
6. Зміна мови не змінює статтю, сторінку пагінації або ID підрозділу і не викликає нового API-запиту.
7. Неіснуючий slug — HTTP 404, збій API — HTTP 503; помилки не показують демо.
8. Деморежим вимкнено обома параметрами. Публікації з’являються у sitemap після успішної відповіді sitemap-методу.
9. Коректні випадки: 0, 1, 16, 17, 20 статей; остання неповна сторінка; відсутня стаття; збій API; усі 5 мов.
10. Перевірити сторінки у Google Search Console після розгортання. Наявність schema та sitemap не гарантує показ розширеного результату.

Довідкові офіційні рекомендації: [мовні версії](https://developers.google.com/search/docs/specialty/international/localized-versions), [пагінація](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), [sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Article](https://developers.google.com/search/docs/appearance/structured-data/article).
