# Перелік відповідності полів CMS

Згенеровано командою `php cms_cli.php mapping`. Шляхи вказано відносно мовної версії (`content[ua]`, `content[cz]`, …) публічного `GET /api/content`.
`[]` — елемент списку. «Спільне» — одне значення для всіх мов; «мова» — окреме значення для кожної мови.

## Перший екран (`home_hero`)

- Сторінка CMS: Головна › Головна сторінка
- Розміщення в JSON: `homepage`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.title` | Головний заголовок | довгий текст | мова |
| `homepage.subtitle` | Підзаголовок | довгий текст | мова |
| `homepage.hero.cta_text` | Кнопка та зображення › Текст кнопки | текст | мова |
| `homepage.hero.cta_target` | Кнопка та зображення › Ціль кнопки | ціль переходу | спільне |
| `homepage.hero.image` | Кнопка та зображення › Головне зображення | зображення | спільне |
| `homepage.hero.image_alt` | Кнопка та зображення › Альтернативний опис зображення | текст | мова |
| `homepage.hero.screenshots` | Кнопка та зображення › Скриншоти першого екрана | список (склад спільний) | спільний склад |
| `homepage.hero.screenshots[].image` | Кнопка та зображення › Скриншоти першого екрана › Скриншот | зображення | спільне |
| `homepage.hero.screenshots[].alt` | Кнопка та зображення › Скриншоти першого екрана › Альтернативний опис | текст | мова |

## Блок «Про нас» (`home_about`)

- Сторінка CMS: Головна › Головна сторінка
- Розміщення в JSON: `homepage.about_us_block`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.about_us_block.visible` | Показувати на сайті | так/ні | спільне |
| `homepage.about_us_block.about_us_title` | Заголовок | текст | мова |
| `homepage.about_us_block.about_us_subtitle` | Опис | довгий текст | мова |
| `homepage.about_us_block.about_us_blocks` | Картки | список (склад спільний) | спільний склад |
| `homepage.about_us_block.about_us_blocks[].about_us_title` | Картки › Заголовок картки | текст | мова |
| `homepage.about_us_block.about_us_blocks[].about_us_description` | Картки › Опис картки | довгий текст | мова |
| `homepage.about_us_block.about_us_blocks[].about_us_image_path` | Картки › Зображення картки | зображення | спільне |
| `homepage.about_us_block.about_us_blocks[].visible` | Картки › Показувати на сайті | так/ні | спільне |

## Слайдер системи (`home_slider`)

- Сторінка CMS: Головна › Головна сторінка
- Розміщення в JSON: `homepage.hero_page_slider_section`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.hero_page_slider_section.visible` | Показувати на сайті | так/ні | спільне |
| `homepage.hero_page_slider_section.section_title` | Заголовок секції | текст | мова |
| `homepage.hero_page_slider_section.slide_image_paths` | Фото і скриншоти слайдера | список | спільне |
| `homepage.hero_page_slider_section.slide_image_paths[]` | Фото і скриншоти слайдера | зображення | спільне |

## Можливості Vortex (`home_why`)

- Сторінка CMS: Головна › Головна сторінка
- Розміщення в JSON: `homepage.why_vortex_section`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.why_vortex_section.visible` | Показувати на сайті | так/ні | спільне |
| `homepage.why_vortex_section.section_title` | Заголовок секції | текст | мова |
| `homepage.why_vortex_section.section_description` | Опис секції | довгий текст | мова |
| `homepage.why_vortex_section.cards` | Картки | список (склад спільний) | спільний склад |
| `homepage.why_vortex_section.cards[].title` | Картки › Заголовок | текст | мова |
| `homepage.why_vortex_section.cards[].description` | Картки › Опис | довгий текст | мова |
| `homepage.why_vortex_section.cards[].image_src` | Картки › Зображення | зображення | спільне |
| `homepage.why_vortex_section.cards[].visible` | Картки › Показувати на сайті | так/ні | спільне |

## Кому підійде Vortex (`home_audience`)

- Сторінка CMS: Головна › Головна сторінка
- Розміщення в JSON: `homepage.vortex_audience_section`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.vortex_audience_section.visible` | Показувати на сайті | так/ні | спільне |
| `homepage.vortex_audience_section.section_title` | Заголовок секції | текст | мова |
| `homepage.vortex_audience_section.cards` | Картки | список (склад спільний) | спільний склад |
| `homepage.vortex_audience_section.cards[].title` | Картки › Заголовок | текст | мова |
| `homepage.vortex_audience_section.cards[].description` | Картки › Опис | довгий текст | мова |
| `homepage.vortex_audience_section.cards[].cta_text` | Картки › Текст кнопки | текст | мова |
| `homepage.vortex_audience_section.cards[].cta_target` | Картки › Ціль кнопки | ціль переходу | спільне |
| `homepage.vortex_audience_section.cards[].image_src` | Картки › Зображення | зображення | спільне |
| `homepage.vortex_audience_section.cards[].visible` | Картки › Показувати на сайті | так/ні | спільне |

## Відгуки (`home_testimonials`)

- Сторінка CMS: Головна › Головна сторінка
- Розміщення в JSON: `homepage.client_testimonials_section`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.client_testimonials_section.visible` | Показувати на сайті | так/ні | спільне |
| `homepage.client_testimonials_section.section_title` | Заголовок секції | текст | мова |
| `homepage.client_testimonials_section.pros_title` | Заголовок переваг | текст | мова |
| `homepage.client_testimonials_section.cons_title` | Заголовок недоліків | текст | мова |
| `homepage.client_testimonials_section.reviews` | Відгуки | список (склад спільний) | спільний склад |
| `homepage.client_testimonials_section.reviews[].company_name` | Відгуки › Компанія | текст | мова |
| `homepage.client_testimonials_section.reviews[].company_type` | Відгуки › Тип компанії | текст | мова |
| `homepage.client_testimonials_section.reviews[].image_src` | Відгуки › Логотип / фото | зображення | спільне |
| `homepage.client_testimonials_section.reviews[].pros` | Відгуки › Переваги | список | мова |
| `homepage.client_testimonials_section.reviews[].pros[]` | Відгуки › Переваги | текст | мова |
| `homepage.client_testimonials_section.reviews[].cons` | Відгуки › Недоліки | список | мова |
| `homepage.client_testimonials_section.reviews[].cons[]` | Відгуки › Недоліки | текст | мова |
| `homepage.client_testimonials_section.reviews[].quote` | Відгуки › Цитата | довгий текст | мова |
| `homepage.client_testimonials_section.reviews[].link_text` | Відгуки › Текст посилання | текст | мова |
| `homepage.client_testimonials_section.reviews[].link_href` | Відгуки › Посилання | ціль переходу | спільне |
| `homepage.client_testimonials_section.reviews[].visible` | Відгуки › Показувати на сайті | так/ні | спільне |

## Каталог інтеграцій (`home_integrations`)

- Сторінка CMS: Головна › Головна сторінка; API-інтеграції › Каталог на головній
- Розміщення в JSON: `homepage.integrations_catalog_section`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.integrations_catalog_section.visible` | Показувати на сайті | так/ні | спільне |
| `homepage.integrations_catalog_section.section_title` | Заголовок секції | текст | мова |
| `homepage.integrations_catalog_section.section_description` | Опис секції | довгий текст | мова |
| `homepage.integrations_catalog_section.cards` | Інтеграції | список (склад спільний) | спільний склад |
| `homepage.integrations_catalog_section.cards[].title` | Інтеграції › Назва | текст | мова |
| `homepage.integrations_catalog_section.cards[].image_src` | Інтеграції › Логотип | зображення | спільне |
| `homepage.integrations_catalog_section.cards[].features` | Інтеграції › Можливості | список | мова |
| `homepage.integrations_catalog_section.cards[].features[]` | Інтеграції › Можливості | текст | мова |
| `homepage.integrations_catalog_section.cards[].link_text` | Інтеграції › Текст посилання | текст | мова |
| `homepage.integrations_catalog_section.cards[].link_href` | Інтеграції › Посилання | ціль переходу | спільне |
| `homepage.integrations_catalog_section.cards[].partner_links` | Інтеграції › Партнерські пропозиції | список (склад спільний) | спільний склад |
| `homepage.integrations_catalog_section.cards[].partner_links[].label` | Інтеграції › Партнерські пропозиції › Підпис пропозиції | текст | мова |
| `homepage.integrations_catalog_section.cards[].partner_links[].href` | Інтеграції › Партнерські пропозиції › Посилання | URL | спільне |
| `homepage.integrations_catalog_section.cards[].visible` | Інтеграції › Показувати на сайті | так/ні | спільне |

## Карта постачальників (`home_suppliers`)

- Сторінка CMS: Головна › Головна сторінка
- Розміщення в JSON: `homepage.suppliers_section`
- Також записує сумісні ключі `ui`: `network.title`, `network.description`, `network.alt`, `supplier.*`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.suppliers_section.visible` | Показувати на сайті | так/ні | спільне |
| `homepage.suppliers_section.title` | Заголовок | текст | мова |
| `homepage.suppliers_section.description` | Опис | довгий текст | мова |
| `homepage.suppliers_section.image` | Ілюстрація | зображення | спільне |
| `homepage.suppliers_section.image_alt` | Альтернативний опис ілюстрації | текст | мова |
| `homepage.suppliers_section.suppliers` | Постачальники | список (склад спільний) | спільний склад |
| `homepage.suppliers_section.suppliers[].id` | Постачальники › ID постачальника | стабільний ID | спільне |
| `homepage.suppliers_section.suppliers[].name` | Постачальники › Назва | текст | мова |
| `homepage.suppliers_section.suppliers[].logo` | Постачальники › Логотип | зображення | спільне |
| `homepage.suppliers_section.suppliers[].logo_alt` | Постачальники › Альтернативний опис логотипу | текст | мова |
| `homepage.suppliers_section.suppliers[].visible` | Постачальники › Показувати на сайті | так/ні | спільне |

## Vortex Sync (`home_sync`)

- Сторінка CMS: Головна › Головна сторінка
- Розміщення в JSON: `homepage.sync_section`
- Також записує сумісні ключі `ui`: `sync.title`, `sync.first`, `sync.second`, `sync.third`, `sync.fourth`, `sync.alt`, `sync.client`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.sync_section.visible` | Показувати на сайті | так/ні | спільне |
| `homepage.sync_section.title` | Заголовок | текст | мова |
| `homepage.sync_section.paragraphs` | Абзаци | список | мова |
| `homepage.sync_section.paragraphs[]` | Абзаци | текст | мова |
| `homepage.sync_section.client_label` | Підпис клієнта на схемі | текст | мова |
| `homepage.sync_section.image` | Ілюстрація | зображення | спільне |
| `homepage.sync_section.image_alt` | Альтернативний опис ілюстрації | текст | мова |

## Короткий блок «Облік СТО» (`home_car_service`)

- Сторінка CMS: Головна › Головна сторінка; Облік СТО › Спільні налаштування
- Розміщення в JSON: `homepage.car_service_section`
- Спільний контент для: Головна, Облік СТО
- Також записує сумісні ключі `ui`: `carOverview.first`, `carOverview.second`, `carOverview.third`, `carOverview.link`, `carOverview.alt`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.car_service_section.visible` | Показувати на сайті | так/ні | спільне |
| `homepage.car_service_section.heading` | Заголовок | текст | мова |
| `homepage.car_service_section.description` | Опис | довгий текст | мова |
| `homepage.car_service_section.car_service_features` | Можливості | список | мова |
| `homepage.car_service_section.car_service_features[]` | Можливості | текст | мова |
| `homepage.car_service_section.paragraphs` | Додаткові абзаци | список | мова |
| `homepage.car_service_section.paragraphs[]` | Додаткові абзаци | текст | мова |
| `homepage.car_service_section.link_text` | Текст посилання | текст | мова |
| `homepage.car_service_section.link_target` | Ціль посилання | ціль переходу | спільне |
| `homepage.car_service_section.image` | Зображення | зображення | спільне |
| `homepage.car_service_section.image_alt` | Альтернативний опис зображення | текст | мова |

## Блок «Розробка веб-сайтів» (`home_websites`)

- Сторінка CMS: Головна › Головна сторінка; Сайти Vortex › Опис
- Розміщення в JSON: `homepage.website_development_section`
- Спільний контент для: Головна, Сайти Vortex
- Також записує сумісні ключі `ui`: `website.alt`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.website_development_section.visible` | Показувати на сайті | так/ні | спільне |
| `homepage.website_development_section.heading` | Заголовок | текст | мова |
| `homepage.website_development_section.gift_message` | Повідомлення про подарунок | довгий текст | мова |
| `homepage.website_development_section.description_paragraphs` | Абзаци опису | список | мова |
| `homepage.website_development_section.description_paragraphs[]` | Абзаци опису | текст | мова |
| `homepage.website_development_section.website_image_src` | Зображення сайту (головна і /websites) | зображення | спільне |
| `homepage.website_development_section.website_image_alt` | Альтернативний опис зображення сайту | текст | мова |
| `homepage.website_development_section.benefit_groups` | Групи переваг | список (склад спільний) | спільний склад |
| `homepage.website_development_section.benefit_groups[].items` | Групи переваг › Пункти | список | мова |
| `homepage.website_development_section.benefit_groups[].items[]` | Групи переваг › Пункти | текст | мова |
| `homepage.website_development_section.benefit_groups[].image_src` | Групи переваг › Зображення групи | зображення | спільне |
| `homepage.website_development_section.benefit_groups[].note` | Групи переваг › Примітка | текст | мова |
| `homepage.website_development_section.upgrade_message` | Повідомлення про покращення сайту | довгий текст | мова |
| `homepage.website_development_section.cta_text` | Текст кнопки | текст | мова |
| `homepage.website_development_section.cta_target` | Ціль кнопки | ціль переходу | спільне |

## Пакети Vortex (`home_vortex_plans`)

- Сторінка CMS: Головна › Пакети Vortex
- Розміщення в JSON: `homepage.vortex_pricing_section`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `homepage.vortex_pricing_section.visible` | Показувати на сайті | так/ні | спільне |
| `homepage.vortex_pricing_section.section_title` | Заголовок секції | текст | мова |
| `homepage.vortex_pricing_section.section_description` | Опис секції | довгий текст | мова |
| `homepage.vortex_pricing_section.billing_labels.monthly` | Підписи періоду оплати › Щомісячно | текст | мова |
| `homepage.vortex_pricing_section.billing_labels.yearly` | Підписи періоду оплати › Щорічно | текст | мова |
| `homepage.vortex_pricing_section.billing_labels.one_time` | Підписи періоду оплати › Разова оплата | текст | мова |
| `homepage.vortex_pricing_section.plans` | Пакети | список (склад спільний) | спільний склад |
| `homepage.vortex_pricing_section.plans[].id` | Пакети › ID пакета | стабільний ID | спільне |
| `homepage.vortex_pricing_section.plans[].name` | Пакети › Назва | текст | мова |
| `homepage.vortex_pricing_section.plans[].description` | Пакети › Опис | довгий текст | мова |
| `homepage.vortex_pricing_section.plans[].price` | Пакети › Ціна | число | спільне |
| `homepage.vortex_pricing_section.plans[].currency` | Пакети › Валюта | текст | спільне |
| `homepage.vortex_pricing_section.plans[].billing_period` | Пакети › Період оплати | список вибору | спільне |
| `homepage.vortex_pricing_section.plans[].features` | Пакети › Що входить | список | мова |
| `homepage.vortex_pricing_section.plans[].features[]` | Пакети › Що входить | текст | мова |
| `homepage.vortex_pricing_section.plans[].cta_text` | Пакети › Текст кнопки | текст | мова |
| `homepage.vortex_pricing_section.plans[].cta_target` | Пакети › Ціль кнопки | ціль переходу | спільне |
| `homepage.vortex_pricing_section.plans[].highlighted` | Пакети › Виділити пакет | так/ні | спільне |
| `homepage.vortex_pricing_section.plans[].visible` | Пакети › Показувати на сайті | так/ні | спільне |

## FAQ (`faq`)

- Сторінка CMS: Головна › FAQ
- Розміщення в JSON: `FAQ`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `FAQ` | Запитання та відповіді | список | мова |
| `FAQ[].topic` | Запитання та відповіді › Запитання | текст | мова |
| `FAQ[].answer` | Запитання та відповіді › Відповідь | HTML (очищується) | мова |
| `FAQ[].visible` | Запитання та відповіді › Показувати на сайті | так/ні | мова |

## Відеоінструкції (`videos`)

- Сторінка CMS: Головна › Відеоінструкції
- Розміщення в JSON: `videos`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `videos` | Відеоінструкції | список | мова |
| `videos[].topic` | Відеоінструкції › Тема | текст | мова |
| `videos[].intro` | Відеоінструкції › Текст перед відео | HTML (очищується) | мова |
| `videos[].cards` | Відеоінструкції › Відеокартки | список | мова |
| `videos[].cards[].title` | Відеоінструкції › Відеокартки › Назва | текст | мова |
| `videos[].cards[].url` | Відеоінструкції › Відеокартки › Посилання | URL | мова |
| `videos[].cards[].caption` | Відеоінструкції › Відеокартки › Підпис | текст | мова |
| `videos[].cards[].brand` | Відеоінструкції › Відеокартки › Позначка бренду | текст | мова |
| `videos[].visible` | Відеоінструкції › Показувати на сайті | так/ні | мова |

## Контакти (`contacts`)

- Сторінка CMS: Головна › Контакти
- Розміщення в JSON: `contacts`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `contacts.title` | Заголовок | текст | мова |
| `contacts.subtitle` | Підзаголовок | довгий текст | мова |
| `contacts.workers` | Працівники | список (склад спільний) | спільний склад |
| `contacts.workers[].contact_topic` | Працівники › Напрям звернення | текст | мова |
| `contacts.workers[].full_name` | Працівники › Ім'я та прізвище | текст | мова |
| `contacts.workers[].role` | Працівники › Посада | текст | мова |
| `contacts.workers[].phone` | Працівники › Телефон | текст | спільне |
| `contacts.workers[].photo_path` | Працівники › Фото | зображення | спільне |
| `contacts.workers[].messenger_links.telegram` | Працівники › Месенджери › Telegram | URL | спільне |
| `contacts.workers[].messenger_links.viber` | Працівники › Месенджери › Viber | URL | спільне |
| `contacts.workers[].messenger_links.whatsapp` | Працівники › Месенджери › WhatsApp | URL | спільне |
| `contacts.workers[].messenger_links.email` | Працівники › Месенджери › Email | URL | спільне |
| `contacts.workers[].visible` | Працівники › Показувати на сайті | так/ні | спільне |

## Калькулятор вартості (`pricing_calculator`)

- Сторінка CMS: Головна › Калькулятор; Облік СТО › Спільні налаштування
- Розміщення в JSON: `settings.pricing_calculator`
- Спільний контент для: Головна, Облік СТО

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `settings.pricing_calculator.currency` | Валюта | текст | спільне |
| `settings.pricing_calculator.base_monthly_price` | Базова ціна на місяць | число | спільне |
| `settings.pricing_calculator.increment` | Крок ціни за менеджера / філію | число | спільне |
| `settings.pricing_calculator.default_manager_count` | Початкова кількість менеджерів | ціле число | спільне |
| `settings.pricing_calculator.default_store_count` | Початкова кількість філій | ціле число | спільне |
| `settings.pricing_calculator.integrations` | Інтеграції | список (склад спільний) | спільний склад |
| `settings.pricing_calculator.integrations[].id` | Інтеграції › ID інтеграції | стабільний ID | спільне |
| `settings.pricing_calculator.integrations[].label` | Інтеграції › Назва | текст | мова |
| `settings.pricing_calculator.integrations[].price` | Інтеграції › Ціна | число | спільне |
| `settings.pricing_calculator.integrations[].billing_period` | Інтеграції › Період оплати | список вибору | спільне |
| `settings.pricing_calculator.integrations[].selected_by_default` | Інтеграції › Обрано за замовчуванням | так/ні | спільне |
| `settings.pricing_calculator.included_features` | Що входить у вартість | список | мова |
| `settings.pricing_calculator.included_features[]` | Що входить у вартість | текст | мова |

## Меню, шапка і футер (`layout`)

- Сторінка CMS: Головна › Меню, шапка і футер
- Розміщення в JSON: `layout`
- Також записує сумісні ключі `ui`: `nav.*`, `common.privacy`, `common.tryFree`, `common.tryDemo`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `layout.header_logo` | Логотип у шапці | зображення | спільне |
| `layout.header_logo_alt` | Опис логотипу в шапці | текст | мова |
| `layout.footer_logo` | Логотип у футері | зображення | спільне |
| `layout.footer_logo_alt` | Опис логотипу у футері | текст | мова |
| `layout.header_menu` | Меню в шапці | список (склад спільний) | спільний склад |
| `layout.header_menu[].id` | Меню в шапці › ID пункту | стабільний ID | спільне |
| `layout.header_menu[].label` | Меню в шапці › Назва | текст | мова |
| `layout.header_menu[].target` | Меню в шапці › Ціль | ціль переходу | спільне |
| `layout.header_menu[].children` | Меню в шапці › Підпункти | список (склад спільний) | спільний склад |
| `layout.header_menu[].children[].id` | Меню в шапці › Підпункти › ID пункту | стабільний ID | спільне |
| `layout.header_menu[].children[].label` | Меню в шапці › Підпункти › Назва | текст | мова |
| `layout.header_menu[].children[].target` | Меню в шапці › Підпункти › Ціль | ціль переходу | спільне |
| `layout.header_menu[].children[].visible` | Меню в шапці › Підпункти › Показувати на сайті | так/ні | спільне |
| `layout.header_menu[].visible` | Меню в шапці › Показувати на сайті | так/ні | спільне |
| `layout.footer_menu` | Меню у футері | список (склад спільний) | спільний склад |
| `layout.footer_menu[].id` | Меню у футері › ID пункту | стабільний ID | спільне |
| `layout.footer_menu[].label` | Меню у футері › Назва | текст | мова |
| `layout.footer_menu[].target` | Меню у футері › Ціль | ціль переходу | спільне |
| `layout.footer_menu[].visible` | Меню у футері › Показувати на сайті | так/ні | спільне |
| `layout.menu` | Плоский список пунктів (для сумісності) | список (склад спільний) | спільний склад |
| `layout.menu[].id` | Плоский список пунктів (для сумісності) › ID пункту | стабільний ID | спільне |
| `layout.menu[].label` | Плоский список пунктів (для сумісності) › Назва | текст | мова |
| `layout.menu[].target` | Плоский список пунктів (для сумісності) › Ціль | ціль переходу | спільне |
| `layout.menu[].visible` | Плоский список пунктів (для сумісності) › Показувати на сайті | так/ні | спільне |
| `layout.buttons.try_free_text` | Загальні кнопки › Текст кнопки «Спробувати безкоштовно» | текст | мова |
| `layout.buttons.try_free_target` | Загальні кнопки › Ціль кнопки «Спробувати безкоштовно» | ціль переходу | спільне |
| `layout.buttons.try_demo_text` | Загальні кнопки › Текст кнопки «Демо» | текст | мова |
| `layout.buttons.try_demo_target` | Загальні кнопки › Ціль кнопки «Демо» | ціль переходу | спільне |
| `layout.socials` | Соціальні мережі | список (склад спільний) | спільний склад |
| `layout.socials[].network` | Соціальні мережі › Мережа | список вибору | спільне |
| `layout.socials[].url` | Соціальні мережі › Посилання | URL | спільне |
| `layout.socials[].label` | Соціальні мережі › Підпис | текст | мова |
| `layout.socials[].icon` | Соціальні мережі › Іконка | зображення | спільне |
| `layout.socials[].visible` | Соціальні мережі › Показувати на сайті | так/ні | спільне |
| `layout.privacy_text` | Текст посилання на політику конфіденційності | текст | мова |
| `layout.privacy_link` | Посилання на політику конфіденційності | ціль переходу | спільне |
| `layout.partner_images` | Партнерські зображення | список (склад спільний) | спільний склад |
| `layout.partner_images[].image` | Партнерські зображення › Зображення | зображення | спільне |
| `layout.partner_images[].alt` | Партнерські зображення › Альтернативний опис | текст | мова |
| `layout.partner_images[].url` | Партнерські зображення › Посилання | ціль переходу | спільне |
| `layout.partner_images[].visible` | Партнерські зображення › Показувати на сайті | так/ні | спільне |

## Тексти інтерфейсу (`ui`)

- Сторінка CMS: Головна › Загальні налаштування (тексти)
- Розміщення в JSON: `ui`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `ui` | Тексти інтерфейсу | набір текстів | мова |

## Сторінка ліцензії TecDoc (`tecdoc`)

- Сторінка CMS: Головна › Ліцензія TecDoc
- Розміщення в JSON: `tecdoc`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `tecdoc.visible` | Показувати на сайті | так/ні | спільне |
| `tecdoc.hero.eyebrow` | Перший екран › Підпис над заголовком | текст | мова |
| `tecdoc.hero.title` | Перший екран › Заголовок | текст | мова |
| `tecdoc.hero.subtitle` | Перший екран › Опис | довгий текст | мова |
| `tecdoc.hero.image` | Перший екран › Зображення | зображення | спільне |
| `tecdoc.hero.image_alt` | Перший екран › Альтернативний опис | текст | мова |
| `tecdoc.hero.cta_text` | Перший екран › Текст кнопки | текст | мова |
| `tecdoc.hero.cta_target` | Перший екран › Ціль кнопки | ціль переходу | спільне |
| `tecdoc.hero.secondary_cta_text` | Перший екран › Текст другої кнопки | текст | мова |
| `tecdoc.hero.secondary_cta_target` | Перший екран › Ціль другої кнопки | ціль переходу | спільне |
| `tecdoc.hero.details` | Перший екран › Короткі переваги під заголовком | список | мова |
| `tecdoc.hero.details[]` | Перший екран › Короткі переваги під заголовком | текст | мова |
| `tecdoc.stats` | Числові показники | список (склад спільний) | спільний склад |
| `tecdoc.stats[].value` | Числові показники › Значення | число | спільне |
| `tecdoc.stats[].suffix` | Числові показники › Суфікс (наприклад, «+» або «млн») | текст | мова |
| `tecdoc.stats[].label` | Числові показники › Підпис | текст | мова |
| `tecdoc.sections` | Блоки сторінки | список (склад спільний) | спільний склад |
| `tecdoc.sections[].id` | Блоки сторінки › ID блоку | стабільний ID | спільне |
| `tecdoc.sections[].eyebrow` | Блоки сторінки › Підпис над заголовком | текст | мова |
| `tecdoc.sections[].title` | Блоки сторінки › Заголовок | текст | мова |
| `tecdoc.sections[].description` | Блоки сторінки › Опис | довгий текст | мова |
| `tecdoc.sections[].items` | Блоки сторінки › Список | список | мова |
| `tecdoc.sections[].items[]` | Блоки сторінки › Список | текст | мова |
| `tecdoc.sections[].image` | Блоки сторінки › Зображення | зображення | спільне |
| `tecdoc.sections[].image_alt` | Блоки сторінки › Альтернативний опис | текст | мова |
| `tecdoc.sections[].button_text` | Блоки сторінки › Текст кнопки | текст | мова |
| `tecdoc.sections[].button_target` | Блоки сторінки › Ціль кнопки | ціль переходу | спільне |
| `tecdoc.sections[].blocks` | Блоки сторінки › Підблоки | список (склад спільний) | спільний склад |
| `tecdoc.sections[].blocks[].id` | Блоки сторінки › Підблоки › ID підблоку | стабільний ID | спільне |
| `tecdoc.sections[].blocks[].title` | Блоки сторінки › Підблоки › Заголовок | текст | мова |
| `tecdoc.sections[].blocks[].paragraphs` | Блоки сторінки › Підблоки › Абзаци | список | мова |
| `tecdoc.sections[].blocks[].paragraphs[]` | Блоки сторінки › Підблоки › Абзаци | текст | мова |
| `tecdoc.sections[].visible` | Блоки сторінки › Показувати на сайті | так/ні | спільне |
| `tecdoc.license.visible` | Вартість ліцензії › Показувати на сайті | так/ні | спільне |
| `tecdoc.license.eyebrow` | Вартість ліцензії › Підпис над ціною | текст | мова |
| `tecdoc.license.price` | Вартість ліцензії › Ціна | число | спільне |
| `tecdoc.license.currency` | Вартість ліцензії › Валюта (ISO-код, наприклад EUR) | текст | спільне |
| `tecdoc.license.billing_type` | Вартість ліцензії › Період ціни | список вибору | спільне |
| `tecdoc.license.price_period` | Вартість ліцензії › Підпис періоду («За ліцензію / місяць») | текст | мова |
| `tecdoc.license.payment_terms` | Вартість ліцензії › Умови оплати | довгий текст | мова |
| `tecdoc.license.trial_terms` | Вартість ліцензії › Умови тестового періоду | довгий текст | мова |
| `tecdoc.license.trial_badge` | Вартість ліцензії › Бейдж тестового періоду | текст | мова |
| `tecdoc.cta.title` | Заклик до дії внизу сторінки › Заголовок | текст | мова |
| `tecdoc.cta.text` | Заклик до дії внизу сторінки › Текст | довгий текст | мова |
| `tecdoc.cta.button_text` | Заклик до дії внизу сторінки › Текст кнопки | текст | мова |
| `tecdoc.cta.button_target` | Заклик до дії внизу сторінки › Ціль кнопки | ціль переходу | спільне |

## Перший екран (`autoshrot_hero`)

- Сторінка CMS: Автошрот › Сторінка
- Розміщення в JSON: `autoshrot.hero`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `autoshrot.hero.visible` | Показувати на сайті | так/ні | спільне |
| `autoshrot.hero.eyebrow` | Короткий підпис над заголовком | текст | мова |
| `autoshrot.hero.title` | Заголовок | текст | мова |
| `autoshrot.hero.slogan` | Слоган | текст | мова |
| `autoshrot.hero.intro` | Вступний текст | довгий текст | мова |
| `autoshrot.hero.cta_text` | Текст кнопки | текст | мова |
| `autoshrot.hero.cta_target` | Ціль кнопки | ціль переходу | спільне |
| `autoshrot.hero.image` | Головне зображення | зображення | спільне |
| `autoshrot.hero.image_alt` | Альтернативний опис | текст | мова |

## Навігація по сторінці (`autoshrot_nav`)

- Сторінка CMS: Автошрот › Сторінка
- Розміщення в JSON: `autoshrot.navigation`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `autoshrot.navigation.visible` | Показувати на сайті | так/ні | спільне |
| `autoshrot.navigation.label` | Доступна назва навігації (для екранних читачів) | текст | мова |
| `autoshrot.navigation.items` | Пункти навігації | список (склад спільний) | спільний склад |
| `autoshrot.navigation.items[].label` | Пункти навігації › Назва | текст | мова |
| `autoshrot.navigation.items[].target` | Пункти навігації › Секція | список вибору | спільне |
| `autoshrot.navigation.items[].visible` | Пункти навігації › Показувати на сайті | так/ні | спільне |

## Картка автомобіля (`autoshrot_car`)

- Сторінка CMS: Автошрот › Сторінка
- Розміщення в JSON: `autoshrot.car`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `autoshrot.car.visible` | Показувати на сайті | так/ні | спільне |
| `autoshrot.car.eyebrow` | Підпис над заголовком | текст | мова |
| `autoshrot.car.title` | Заголовок | текст | мова |
| `autoshrot.car.description` | Опис | довгий текст | мова |
| `autoshrot.car.image` | Зображення | зображення | спільне |
| `autoshrot.car.image_alt` | Альтернативний опис | текст | мова |
| `autoshrot.car.characteristics` | Характеристики автомобіля | список | мова |
| `autoshrot.car.characteristics[]` | Характеристики автомобіля | текст | мова |
| `autoshrot.car.benefits` | Картки переваг | список (склад спільний) | спільний склад |
| `autoshrot.car.benefits[].title` | Картки переваг › Заголовок | текст | мова |
| `autoshrot.car.benefits[].description` | Картки переваг › Опис | довгий текст | мова |
| `autoshrot.car.benefits[].visible` | Картки переваг › Показувати на сайті | так/ні | спільне |

## Статуси розборки (`autoshrot_statuses`)

- Сторінка CMS: Автошрот › Сторінка
- Розміщення в JSON: `autoshrot.statuses`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `autoshrot.statuses.visible` | Показувати на сайті | так/ні | спільне |
| `autoshrot.statuses.eyebrow` | Підпис над заголовком | текст | мова |
| `autoshrot.statuses.title` | Заголовок секції | текст | мова |
| `autoshrot.statuses.description` | Опис секції | довгий текст | мова |
| `autoshrot.statuses.items` | Статуси | список (склад спільний) | спільний склад |
| `autoshrot.statuses.items[].name` | Статуси › Назва статусу | текст | мова |
| `autoshrot.statuses.items[].card_title` | Статуси › Заголовок картки | текст | мова |
| `autoshrot.statuses.items[].card_description` | Статуси › Опис картки | довгий текст | мова |
| `autoshrot.statuses.items[].visible` | Статуси › Показувати на сайті | так/ні | спільне |

## Зняття запчастин (`autoshrot_removal`)

- Сторінка CMS: Автошрот › Сторінка
- Розміщення в JSON: `autoshrot.removal`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `autoshrot.removal.visible` | Показувати на сайті | так/ні | спільне |
| `autoshrot.removal.eyebrow` | Підпис над заголовком | текст | мова |
| `autoshrot.removal.title` | Заголовок | текст | мова |
| `autoshrot.removal.description` | Опис | довгий текст | мова |
| `autoshrot.removal.image` | Зображення | зображення | спільне |
| `autoshrot.removal.image_alt` | Альтернативний опис | текст | мова |
| `autoshrot.removal.methods` | Методи | список (склад спільний) | спільний склад |
| `autoshrot.removal.methods[].title` | Методи › Заголовок | текст | мова |
| `autoshrot.removal.methods[].description` | Методи › Опис | довгий текст | мова |
| `autoshrot.removal.methods[].visible` | Методи › Показувати на сайті | так/ні | спільне |

## Послідовність роботи (`autoshrot_workflow`)

- Сторінка CMS: Автошрот › Сторінка
- Розміщення в JSON: `autoshrot.workflow`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `autoshrot.workflow.visible` | Показувати на сайті | так/ні | спільне |
| `autoshrot.workflow.title` | Заголовок | текст | мова |
| `autoshrot.workflow.steps` | Кроки | список | мова |
| `autoshrot.workflow.steps[]` | Кроки | текст | мова |
| `autoshrot.workflow.note` | Пояснення або приклад під списком | довгий текст | мова |

## Сумісність старих якорів (`autoshrot_aliases`)

- Сторінка CMS: Автошрот › Сторінка
- Розміщення в JSON: `autoshrot.anchor_aliases`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `autoshrot.anchor_aliases{id}` | Старий якір → секція | список вибору | спільне |

## Сторінка «Облік СТО» (`car_service`)

- Сторінка CMS: Облік СТО › Сторінка
- Розміщення в JSON: `car_service`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `car_service.title` | Заголовок | текст | мова |
| `car_service.subtitle` | Підзаголовок | довгий текст | мова |
| `car_service.blocks` | Блоки | список (склад спільний) | спільний склад |
| `car_service.blocks[].id` | Блоки › ID блока | стабільний ID | спільне |
| `car_service.blocks[].title` | Блоки › Заголовок | текст | мова |
| `car_service.blocks[].image_src` | Блоки › Зображення | зображення | спільне |
| `car_service.blocks[].image_alt` | Блоки › Альтернативний опис зображення | текст | мова |
| `car_service.blocks[].paragraphs` | Блоки › Абзаци | список | мова |
| `car_service.blocks[].paragraphs[]` | Блоки › Абзаци | текст | мова |
| `car_service.blocks[].list_intro` | Блоки › Вступ до списку | текст | мова |
| `car_service.blocks[].items` | Блоки › Пункти списку | список | мова |
| `car_service.blocks[].items[]` | Блоки › Пункти списку | текст | мова |
| `car_service.blocks[].closing_paragraphs` | Блоки › Завершальні абзаци | список | мова |
| `car_service.blocks[].closing_paragraphs[]` | Блоки › Завершальні абзаци | текст | мова |
| `car_service.blocks[].documents` | Блоки › Документи | список (склад спільний) | спільний склад |
| `car_service.blocks[].documents[].label` | Блоки › Документи › Назва | текст | мова |
| `car_service.blocks[].documents[].href` | Блоки › Документи › Файл або посилання | PDF/посилання | спільне |
| `car_service.blocks[].note` | Блоки › Примітка | довгий текст | мова |
| `car_service.blocks[].visible` | Блоки › Показувати на сайті | так/ні | спільне |

## Приклади сайтів (`websites_gallery`)

- Сторінка CMS: Сайти Vortex › Приклади сайтів
- Розміщення в JSON: `websites.gallery`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `websites.gallery.visible` | Показувати на сайті | так/ні | спільне |
| `websites.gallery.section_title` | Заголовок секції | текст | мова |
| `websites.gallery.items` | Приклади | список (склад спільний) | спільний склад |
| `websites.gallery.items[].id` | Приклади › ID прикладу | стабільний ID | спільне |
| `websites.gallery.items[].image` | Приклади › Скриншот | зображення | спільне |
| `websites.gallery.items[].title` | Приклади › Назва | текст | мова |
| `websites.gallery.items[].alt` | Приклади › Альтернативний опис | текст | мова |
| `websites.gallery.items[].template` | Приклади › Тип шаблону | текст | мова |
| `websites.gallery.items[].url` | Приклади › Посилання на приклад | URL | спільне |
| `websites.gallery.items[].visible` | Приклади › Показувати на сайті | так/ні | спільне |

## Тарифи сайтів (`websites_tariffs`)

- Сторінка CMS: Сайти Vortex › Тарифи
- Розміщення в JSON: `websites.pricing`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `websites.pricing.visible` | Показувати на сайті | так/ні | спільне |
| `websites.pricing.section_title` | Заголовок секції | текст | мова |
| `websites.pricing.section_description` | Опис секції | довгий текст | мова |
| `websites.pricing.tariffs` | Тарифи | список (склад спільний) | спільний склад |
| `websites.pricing.tariffs[].id` | Тарифи › ID тарифу (передається в заявку) | стабільний ID | спільне |
| `websites.pricing.tariffs[].name` | Тарифи › Назва | текст | мова |
| `websites.pricing.tariffs[].price` | Тарифи › Ціна | число | спільне |
| `websites.pricing.tariffs[].currency` | Тарифи › Валюта (ISO-код, наприклад USD) | текст | спільне |
| `websites.pricing.tariffs[].billing_type` | Тарифи › Тип оплати | список вибору | спільне |
| `websites.pricing.tariffs[].extra_payments_note` | Тарифи › Пояснення додаткових платежів | довгий текст | мова |
| `websites.pricing.tariffs[].cta_text` | Тарифи › Текст кнопки | текст | мова |
| `websites.pricing.tariffs[].visible` | Тарифи › Показувати на сайті | так/ні | спільне |
| `websites.pricing.services` | Послуги | список (склад спільний) | спільний склад |
| `websites.pricing.services[].id` | Послуги › ID послуги | стабільний ID | спільне |
| `websites.pricing.services[].text` | Послуги › Текст | текст | мова |
| `websites.pricing.services[].plans{id}.included` | Послуги › Входження в тарифи › Входить у пакет | так/ні | спільне |
| `websites.pricing.services[].plans{id}.note` | Послуги › Входження в тарифи › Обмеження або уточнення | текст | мова |
| `websites.pricing.services[].plans{id}.text` | Послуги › Входження в тарифи › Окремий текст послуги для цього тарифу | текст | мова |

## Спільні тексти сторінок інтеграцій (`integration_pages`)

- Сторінка CMS: API-інтеграції › Сторінки інтеграцій
- Розміщення в JSON: `integration_pages`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `integration_pages.visible` | Показувати на сайті | так/ні | спільне |
| `integration_pages.label` | Назва розділу (хлібні крихти) | текст | мова |
| `integration_pages.eyebrow` | Підпис над заголовком | текст | мова |
| `integration_pages.connect` | Кнопка «Підключити» | текст | мова |
| `integration_pages.viewFeatures` | Кнопка «Можливості інтеграції» | текст | мова |
| `integration_pages.featuresTitle` | Заголовок списку можливостей | текст | мова |
| `integration_pages.linksTitle` | Заголовок партнерських пропозицій | текст | мова |
| `integration_pages.back` | Посилання «Усі інтеграції» | текст | мова |
| `integration_pages.relatedTitle` | Заголовок «Інші інтеграції» | текст | мова |

## Сторінки інтеграцій (`integration_pages_list`)

- Сторінка CMS: API-інтеграції › Сторінки інтеграцій
- Розміщення в JSON: `integration_pages.pages`
- Формат у JSON: в адмінці це список, у публічному JSON — об'єкт за slug: `integration_pages.pages[slug]` (з обчисленим `path` = `/integrations/{slug}`); поле `seo` кожної сторінки публікується окремо в `seo.integrations[slug]`.

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `integration_pages.pages` | Сторінки | список (склад спільний) | спільний склад |
| `integration_pages.pages[].slug` | Сторінки › Slug (адреса /integrations/{slug}) | стабільний ID | спільне |
| `integration_pages.pages[].visible` | Сторінки › Показувати на сайті | так/ні | спільне |
| `integration_pages.pages[].title` | Сторінки › Назва | текст | мова |
| `integration_pages.pages[].lead` | Сторінки › Вступ | довгий текст | мова |
| `integration_pages.pages[].logo` | Сторінки › Логотип | зображення | спільне |
| `integration_pages.pages[].logo_alt` | Сторінки › Опис логотипу | текст | мова |
| `integration_pages.pages[].sections` | Сторінки › Розділи | список (склад спільний) | спільний склад |
| `integration_pages.pages[].sections[].id` | Сторінки › Розділи › ID розділу | стабільний ID | спільне |
| `integration_pages.pages[].sections[].title` | Сторінки › Розділи › Заголовок | текст | мова |
| `integration_pages.pages[].sections[].paragraphs` | Сторінки › Розділи › Абзаци | список | мова |
| `integration_pages.pages[].sections[].paragraphs[]` | Сторінки › Розділи › Абзаци | текст | мова |
| `integration_pages.pages[].sections[].items` | Сторінки › Розділи › Пункти списку | список | мова |
| `integration_pages.pages[].sections[].items[]` | Сторінки › Розділи › Пункти списку | текст | мова |
| `integration_pages.pages[].sections[].image` | Сторінки › Розділи › Ілюстрація розділу | зображення | спільне |
| `integration_pages.pages[].sections[].image_alt` | Сторінки › Розділи › Опис ілюстрації | текст | мова |
| `integration_pages.pages[].gallery` | Сторінки › Галерея після розділів | список (склад спільний) | спільний склад |
| `integration_pages.pages[].gallery[].id` | Сторінки › Галерея після розділів › ID зображення | стабільний ID | спільне |
| `integration_pages.pages[].gallery[].image` | Сторінки › Галерея після розділів › Зображення | зображення | спільне |
| `integration_pages.pages[].gallery[].alt` | Сторінки › Галерея після розділів › Опис зображення | текст | мова |
| `integration_pages.pages[].links` | Сторінки › Партнерські посилання | список (склад спільний) | спільний склад |
| `integration_pages.pages[].links[].label` | Сторінки › Партнерські посилання › Підпис | текст | мова |
| `integration_pages.pages[].links[].href` | Сторінки › Партнерські посилання › Посилання | URL | спільне |
| `integration_pages.pages[].seo.title` | Сторінки › SEO сторінки › SEO title | текст | мова |
| `integration_pages.pages[].seo.description` | Сторінки › SEO сторінки › SEO description | довгий текст | мова |
| `integration_pages.pages[].seo.share_image` | Сторінки › SEO сторінки › Зображення для поширення (Open Graph) | зображення | спільне |
| `integration_pages.pages[].seo.share_image_alt` | Сторінки › SEO сторінки › Опис зображення для поширення | текст | мова |
| `integration_pages.pages[].seo.indexing` | Сторінки › SEO сторінки › Індексація | список вибору | спільне |

## Політика конфіденційності (`privacy_policy`)

- Сторінка CMS: Головна › Політика конфіденційності
- Розміщення в JSON: `privacy_policy`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `privacy_policy.visible` | Показувати на сайті | так/ні | спільне |
| `privacy_policy.eyebrow` | Підпис над заголовком | текст | мова |
| `privacy_policy.title` | Заголовок | текст | мова |
| `privacy_policy.lead` | Вступ | довгий текст | мова |
| `privacy_policy.updated` | Підпис дати оновлення («Дата оновлення:») | текст | мова |
| `privacy_policy.updated_at` | Дата редакції | текст | спільне |
| `privacy_policy.contents` | Заголовок змісту документа | текст | мова |
| `privacy_policy.sections` | Розділи | список (склад спільний) | спільний склад |
| `privacy_policy.sections[].id` | Розділи › ID розділу (якір privacy-{ID}) | стабільний ID | спільне |
| `privacy_policy.sections[].title` | Розділи › Заголовок | текст | мова |
| `privacy_policy.sections[].html` | Розділи › Текст розділу | HTML (очищується) | мова |

## Тексти блогу (`blog_copy`)

- Сторінка CMS: Блог › Тексти блогу
- Розміщення в JSON: `blog_copy`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `blog_copy.title` | Заголовок сторінки блогу | текст | мова |
| `blog_copy.intro` | Вступ | довгий текст | мова |
| `blog_copy.texts` | Допоміжні тексти | набір текстів | мова |

## SEO: Головна (`seo_home`)

- Сторінка CMS: Головна › SEO
- Розміщення в JSON: `seo.home`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `seo.home.title` | SEO title | текст | мова |
| `seo.home.description` | SEO description | довгий текст | мова |
| `seo.home.share_image` | Зображення для поширення (Open Graph) | зображення | спільне |
| `seo.home.share_image_alt` | Опис зображення для поширення | текст | мова |
| `seo.home.indexing` | Індексація | список вибору | спільне |

## SEO: FAQ (`seo_faq`)

- Сторінка CMS: Головна › SEO
- Розміщення в JSON: `seo.faq`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `seo.faq.title` | SEO title | текст | мова |
| `seo.faq.description` | SEO description | довгий текст | мова |
| `seo.faq.share_image` | Зображення для поширення (Open Graph) | зображення | спільне |
| `seo.faq.share_image_alt` | Опис зображення для поширення | текст | мова |
| `seo.faq.indexing` | Індексація | список вибору | спільне |

## SEO: Контакти (`seo_contacts`)

- Сторінка CMS: Головна › SEO
- Розміщення в JSON: `seo.contacts`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `seo.contacts.title` | SEO title | текст | мова |
| `seo.contacts.description` | SEO description | довгий текст | мова |
| `seo.contacts.share_image` | Зображення для поширення (Open Graph) | зображення | спільне |
| `seo.contacts.share_image_alt` | Опис зображення для поширення | текст | мова |
| `seo.contacts.indexing` | Індексація | список вибору | спільне |

## SEO: Ліцензія TecDoc (`seo_tecdoc`)

- Сторінка CMS: Головна › Ліцензія TecDoc
- Розміщення в JSON: `seo.tecdoc`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `seo.tecdoc.title` | SEO title | текст | мова |
| `seo.tecdoc.description` | SEO description | довгий текст | мова |
| `seo.tecdoc.share_image` | Зображення для поширення (Open Graph) | зображення | спільне |
| `seo.tecdoc.share_image_alt` | Опис зображення для поширення | текст | мова |
| `seo.tecdoc.indexing` | Індексація | список вибору | спільне |

## SEO: Автошрот (`seo_autoshrot`)

- Сторінка CMS: Автошрот › SEO
- Розміщення в JSON: `seo.autoshrot`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `seo.autoshrot.title` | SEO title | текст | мова |
| `seo.autoshrot.description` | SEO description | довгий текст | мова |
| `seo.autoshrot.share_image` | Зображення для поширення (Open Graph) | зображення | спільне |
| `seo.autoshrot.share_image_alt` | Опис зображення для поширення | текст | мова |
| `seo.autoshrot.indexing` | Індексація | список вибору | спільне |

## SEO: Облік СТО (`seo_car_service`)

- Сторінка CMS: Облік СТО › SEO
- Розміщення в JSON: `seo.car_service`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `seo.car_service.title` | SEO title | текст | мова |
| `seo.car_service.description` | SEO description | довгий текст | мова |
| `seo.car_service.share_image` | Зображення для поширення (Open Graph) | зображення | спільне |
| `seo.car_service.share_image_alt` | Опис зображення для поширення | текст | мова |
| `seo.car_service.indexing` | Індексація | список вибору | спільне |

## SEO: Сайти Vortex (`seo_websites`)

- Сторінка CMS: Сайти Vortex › SEO
- Розміщення в JSON: `seo.websites`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `seo.websites.title` | SEO title | текст | мова |
| `seo.websites.description` | SEO description | довгий текст | мова |
| `seo.websites.share_image` | Зображення для поширення (Open Graph) | зображення | спільне |
| `seo.websites.share_image_alt` | Опис зображення для поширення | текст | мова |
| `seo.websites.indexing` | Індексація | список вибору | спільне |

## SEO: Блог (список статей) (`seo_blog`)

- Сторінка CMS: Блог › SEO
- Розміщення в JSON: `seo.blog`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `seo.blog.title` | SEO title | текст | мова |
| `seo.blog.description` | SEO description | довгий текст | мова |
| `seo.blog.share_image` | Зображення для поширення (Open Graph) | зображення | спільне |
| `seo.blog.share_image_alt` | Опис зображення для поширення | текст | мова |
| `seo.blog.indexing` | Індексація | список вибору | спільне |

## SEO: Політика конфіденційності (`seo_privacy_policy`)

- Сторінка CMS: Головна › Політика конфіденційності
- Розміщення в JSON: `seo.privacy_policy`

| Поле джерела / API | Поле CMS | Тип | Мовність |
|---|---|---|---|
| `seo.privacy_policy.title` | SEO title | текст | мова |
| `seo.privacy_policy.description` | SEO description | довгий текст | мова |
| `seo.privacy_policy.share_image` | Зображення для поширення (Open Graph) | зображення | спільне |
| `seo.privacy_policy.share_image_alt` | Опис зображення для поширення | текст | мова |
| `seo.privacy_policy.indexing` | Індексація | список вибору | спільне |

