import type { Language } from '../types/content';
import { LANGUAGES } from '../types/content';
import type { BlogList, BlogSummary, LocalizedText } from './types';
import { BLOG_PAGE_SIZE } from './types';
const topics: Record<Language, string[]> = {
  ua: ['Як упорядкувати облік автозапчастин', 'Інвентаризація без зайвої метушні', 'Робота з постачальниками', 'Перші кроки у Vortex', 'Підбір деталей через каталог', 'Документи в щоденній роботі', 'Адресне зберігання на складі', 'Контроль клієнтських замовлень', 'Звіти для керівника', 'Історія взаємодії з клієнтом', 'Як організувати повернення', 'Актуальність цін і залишків', 'Планування роботи СТО', 'Облік автомобілів на розборці', 'Каталог TecDoc у роботі магазину', 'Сайт магазину автозапчастин', 'Автоматизація повторюваних завдань', 'Робота кількох філій', 'Аналітика продажів', 'Доступ працівників до даних'],
  en: ['Organizing auto parts inventory', 'Stocktaking without the rush', 'Working with suppliers', 'Getting started with Vortex', 'Finding parts in a catalog', 'Documents in daily work', 'Warehouse bin locations', 'Tracking customer orders', 'Reports for managers', 'Customer interaction history', 'Organizing returns', 'Keeping prices and stock current', 'Planning workshop operations', 'Tracking dismantling vehicles', 'TecDoc in a parts store', 'An auto parts store website', 'Automating recurring tasks', 'Managing multiple branches', 'Sales analytics', 'Employee access to data'],
  pl: ['Jak uporządkować ewidencję części', 'Inwentaryzacja bez pośpiechu', 'Współpraca z dostawcami', 'Pierwsze kroki w Vortex', 'Dobór części z katalogu', 'Dokumenty w codziennej pracy', 'Lokalizacje towarów w magazynie', 'Kontrola zamówień klientów', 'Raporty dla kierownika', 'Historia kontaktów z klientem', 'Organizacja zwrotów', 'Aktualne ceny i stany', 'Planowanie pracy warsztatu', 'Ewidencja pojazdów do demontażu', 'TecDoc w sklepie z częściami', 'Strona sklepu z częściami', 'Automatyzacja powtarzalnych zadań', 'Zarządzanie oddziałami', 'Analiza sprzedaży', 'Dostęp pracowników do danych'],
  cz: ['Jak uspořádat evidenci autodílů', 'Inventura bez zbytečného shonu', 'Spolupráce s dodavateli', 'První kroky ve Vortex', 'Výběr dílů v katalogu', 'Dokumenty v každodenní práci', 'Skladové pozice', 'Kontrola objednávek zákazníků', 'Reporty pro vedoucí', 'Historie komunikace se zákazníkem', 'Organizace vrácení zboží', 'Aktuální ceny a zásoby', 'Plánování práce autoservisu', 'Evidence vozidel k demontáži', 'TecDoc v prodejně autodílů', 'Web prodejny autodílů', 'Automatizace opakovaných úkolů', 'Správa více poboček', 'Analýza prodeje', 'Přístup zaměstnanců k datům'],
  sk: ['Ako usporiadať evidenciu autodielov', 'Inventúra bez zbytočného zhonu', 'Spolupráca s dodávateľmi', 'Prvé kroky vo Vortex', 'Výber dielov v katalógu', 'Dokumenty v každodennej práci', 'Skladové pozície', 'Kontrola objednávok zákazníkov', 'Reporty pre vedúcich', 'História komunikácie so zákazníkom', 'Organizácia vrátenia tovaru', 'Aktuálne ceny a zásoby', 'Plánovanie práce autoservisu', 'Evidencia vozidiel na demontáž', 'TecDoc v predajni autodielov', 'Web predajne autodielov', 'Automatizácia opakovaných úloh', 'Správa viacerých pobočiek', 'Analýza predaja', 'Prístup zamestnancov k dátam'],
};
const slugs = ['inventory-control', 'stocktaking', 'suppliers', 'getting-started', 'parts-catalog', 'documents', 'warehouse-locations', 'customer-orders', 'management-reports', 'customer-history', 'returns', 'prices-and-stock', 'workshop-planning', 'dismantling-records', 'tecdoc-catalog', 'store-website', 'automation', 'branches', 'sales-analytics', 'access-control'];
const excerpts: LocalizedText = {
  ua: 'Основні кроки та практичні поради для щоденної роботи магазину автозапчастин і СТО.',
  en: 'Essential steps and practical advice for the daily work of auto parts stores and workshops.',
  pl: 'Najważniejsze kroki i praktyczne wskazówki do codziennej pracy sklepu z częściami i warsztatu.',
  cz: 'Základní kroky a praktické rady pro každodenní práci prodejen autodílů a autoservisů.',
  sk: 'Základné kroky a praktické rady pre každodennú prácu predajní autodielov a autoservisov.',
};
export function demoSummaries(): BlogSummary[] {
  return slugs.map((slug, index) => ({
    id: `demo-${index + 1}`, slug,
    cover: { url: `/imgs/3dicons_premium/${['folder.png', 'monitor.png', '3d-document-premium.png', 'wallet.png'][index % 4]}`, width: 512, height: 512, alt: Object.fromEntries(LANGUAGES.map(language => [language, topics[language][index]])) as LocalizedText },
    publishedAt: new Date(Date.UTC(2026, 9, 31 - index, 9)).toISOString(),
    updatedAt: new Date(Date.UTC(2026, 9, 31 - index, 9)).toISOString(),
    author: { name: 'Vortex', type: 'Organization' },
    translations: Object.fromEntries(LANGUAGES.map(language => [language, { title: topics[language][index], excerpt: excerpts[language], seo: { title: `${topics[language][index]} | Vortex`, description: excerpts[language] } }])) as BlogSummary['translations'],
  }));
}
export function demoList(page: number): BlogList {
  const data = demoSummaries();
  return { data: data.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE), pagination: { page, limit: BLOG_PAGE_SIZE, total: data.length, totalPages: Math.ceil(data.length / BLOG_PAGE_SIZE) } };
}
