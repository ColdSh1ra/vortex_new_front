import { Link } from 'react-router-dom';
import { useI18n } from '../context/ContentContext';
import { useBlog } from '../blog/BlogContext';
import { blogText } from '../blog/copy';
import { blogUrl, formatBlogDate } from '../blog/urls';
import type { BlogArticle } from '../blog/types';
import BlogStatus from '../blog/BlogStatus';

// STATIC DEMO JSON: remove this object and disable BLOG_DEMO_MODE / VITE_BLOG_DEMO_MODE after connecting the API.
// It is never used to replace a real API 404 or another backend error.
export const DEMO_BLOG_ARTICLE: BlogArticle = {
  id: 'demo-1', slug: 'inventory-control',
  cover: { url: '/imgs/3dicons_premium/folder.png', width: 512, height: 512, alt: { ua: 'Облік автозапчастин', en: 'Auto parts inventory', pl: 'Ewidencja części', cz: 'Evidence autodílů', sk: 'Evidencia autodielov' } },
  author: { name: 'Vortex', type: 'Organization' },
  publishedAt: '2026-10-31T09:00:00.000Z', updatedAt: '2026-10-31T09:00:00.000Z',
  translations: {
    ua: { title: 'Як упорядкувати облік автозапчастин', excerpt: 'Практичні кроки для впорядкування даних, залишків і роботи команди.', seo: { title: 'Облік автозапчастин | Блог Vortex', description: 'Демонстраційна стаття про підготовку даних, контроль залишків та щоденні процеси.' }, sections: [
      { id: 'prepare-data', heading: 'Підготуйте дані про товари', paragraphs: ['Почніть із назв, артикулів та виробників. Єдиний підхід до заповнення карток допомагає команді швидше знаходити потрібну запчастину.', 'Перегляньте дублікати й уточніть інформацію до початку інвентаризації.'] },
      { id: 'check-stock', heading: 'Перевірте залишки', paragraphs: ['Порівняйте облікові залишки з фактичною наявністю на складі. Розділіть перевірку на невеликі групи товарів.', 'Зафіксуйте розбіжності та їхні причини, щоб виправити процес, а не лише цифри.'] },
      { id: 'daily-work', heading: 'Узгодьте щоденну роботу', paragraphs: ['Домовтеся, хто відповідає за приймання, видачу та перевірку документів. Зрозумілий порядок зменшує кількість пропущених операцій.', 'Регулярно переглядайте результати разом із командою та оновлюйте робочі інструкції.'] },
    ] },
    en: { title: 'Organizing auto parts inventory', excerpt: 'Practical steps for organizing data, stock and teamwork.', seo: { title: 'Auto parts inventory | Vortex blog', description: 'A demo article about preparing data, checking stock and daily workflows.' }, sections: [
      { id: 'prepare-data', heading: 'Prepare your product data', paragraphs: ['Start with names, part numbers and manufacturers. A consistent approach to product records helps the team find the right part faster.', 'Review duplicates and clarify information before starting stocktaking.'] },
      { id: 'check-stock', heading: 'Check stock levels', paragraphs: ['Compare recorded quantities with actual warehouse stock. Divide the check into small product groups.', 'Record discrepancies and their causes so you can improve the process rather than just the numbers.'] },
      { id: 'daily-work', heading: 'Agree on daily workflows', paragraphs: ['Agree who handles receiving, dispatch and document checks. Clear responsibilities reduce missed operations.', 'Review results with your team regularly and update working instructions.'] },
    ] },
    pl: { title: 'Jak uporządkować ewidencję części', excerpt: 'Praktyczne kroki porządkowania danych, stanów i pracy zespołu.', seo: { title: 'Ewidencja części | Blog Vortex', description: 'Artykuł demonstracyjny o danych, kontroli stanów i codziennej pracy.' }, sections: [
      { id: 'prepare-data', heading: 'Przygotuj dane produktów', paragraphs: ['Zacznij od nazw, numerów części i producentów. Jednolity sposób wypełniania kart ułatwia zespołowi znalezienie właściwej części.', 'Przejrzyj duplikaty i uzupełnij dane przed inwentaryzacją.'] },
      { id: 'check-stock', heading: 'Sprawdź stany magazynowe', paragraphs: ['Porównaj ewidencję z faktycznym stanem magazynu. Podziel kontrolę na niewielkie grupy produktów.', 'Zapisz różnice i ich przyczyny, aby poprawić proces, a nie tylko liczby.'] },
      { id: 'daily-work', heading: 'Uzgodnij codzienną pracę', paragraphs: ['Ustal, kto odpowiada za przyjęcie, wydanie i kontrolę dokumentów. Jasny podział zadań ogranicza pominięte operacje.', 'Regularnie omawiaj wyniki z zespołem i aktualizuj instrukcje pracy.'] },
    ] },
    cz: { title: 'Jak uspořádat evidenci autodílů', excerpt: 'Praktické kroky pro uspořádání dat, zásob a práce týmu.', seo: { title: 'Evidence autodílů | Blog Vortex', description: 'Ukázkový článek o přípravě dat, kontrole zásob a každodenní práci.' }, sections: [
      { id: 'prepare-data', heading: 'Připravte údaje o produktech', paragraphs: ['Začněte názvy, čísly dílů a výrobci. Jednotné vyplňování karet pomáhá týmu rychleji najít správný díl.', 'Před inventurou projděte duplicity a doplňte informace.'] },
      { id: 'check-stock', heading: 'Zkontrolujte zásoby', paragraphs: ['Porovnejte evidované množství se skutečnými zásobami. Rozdělte kontrolu do menších skupin produktů.', 'Zaznamenejte rozdíly i příčiny, abyste opravili proces, nejen čísla.'] },
      { id: 'daily-work', heading: 'Dohodněte každodenní práci', paragraphs: ['Určete odpovědnost za příjem, výdej a kontrolu dokumentů. Jasný postup snižuje počet vynechaných operací.', 'Pravidelně probírejte výsledky s týmem a aktualizujte pracovní pokyny.'] },
    ] },
    sk: { title: 'Ako usporiadať evidenciu autodielov', excerpt: 'Praktické kroky na usporiadanie údajov, zásob a práce tímu.', seo: { title: 'Evidencia autodielov | Blog Vortex', description: 'Ukážkový článok o príprave údajov, kontrole zásob a každodennej práci.' }, sections: [
      { id: 'prepare-data', heading: 'Pripravte údaje o produktoch', paragraphs: ['Začnite názvami, číslami dielov a výrobcami. Jednotné vypĺňanie kariet pomáha tímu rýchlejšie nájsť správny diel.', 'Pred inventúrou prejdite duplicity a doplňte informácie.'] },
      { id: 'check-stock', heading: 'Skontrolujte zásoby', paragraphs: ['Porovnajte evidované množstvo so skutočnými zásobami. Rozdeľte kontrolu do menších skupín produktov.', 'Zaznamenajte rozdiely aj príčiny, aby ste opravili proces, nielen čísla.'] },
      { id: 'daily-work', heading: 'Dohodnite každodennú prácu', paragraphs: ['Určte zodpovednosť za príjem, výdaj a kontrolu dokumentov. Jasný postup znižuje počet vynechaných operácií.', 'Pravidelne preberajte výsledky s tímom a aktualizujte pracovné pokyny.'] },
    ] },
  },
};

export default function BlogArticlePage() {
  const { language, t } = useI18n();
  const { resource, loading } = useBlog();
  if (loading || !resource || resource.status !== 'ready' || !resource.article) return <BlogStatus />;
  const article = resource.article;
  const copy = article.translations[language];
  return <div className="blog-page blog-article-page">
    <nav className="blog-breadcrumbs" aria-label={t('common.breadcrumbs')}><ol>
      <li><Link to="/">{t('common.home')}</Link></li><li aria-hidden="true">/</li>
      <li><Link to={blogUrl(language)}>{blogText(language, 'nav.blog')}</Link></li><li aria-hidden="true">/</li><li aria-current="page">{copy.title}</li>
    </ol></nav>
    {resource.mode === 'demo' && <p className="blog-demo-note">{blogText(language, 'demo')} — {blogText(language, 'demoNote')}</p>}
    <article>
      <header className="blog-article-heading"><p className="blog-eyebrow">Vortex / {blogText(language, 'nav.blog')}</p><h1>{copy.title}</h1><p>{copy.excerpt}</p>
        <div className="blog-article-meta"><span>{article.author.name}</span><span>{blogText(language, 'published')}: <time dateTime={article.publishedAt}>{formatBlogDate(article.publishedAt, language)}</time></span>
          {article.updatedAt !== article.publishedAt && <span>{blogText(language, 'updated')}: <time dateTime={article.updatedAt}>{formatBlogDate(article.updatedAt, language)}</time></span>}
        </div>
      </header>
      <nav className="blog-toc" aria-labelledby="blog-toc-heading"><h2 id="blog-toc-heading">{blogText(language, 'contents')}</h2><ol>{copy.sections.map(section => <li key={section.id}><Link to={`${blogUrl(language, article.slug)}#${section.id}`}>{section.heading}<span aria-hidden="true">↓</span></Link></li>)}</ol></nav>
      <div className="blog-article-body">{copy.sections.map(section => <section id={section.id} key={section.id} aria-labelledby={`${section.id}-heading`}><h2 id={`${section.id}-heading`}>{section.heading}</h2>{section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</section>)}</div>
    </article>
    <Link className="blog-back" to={blogUrl(language)}>← {blogText(language, 'back')}</Link>
  </div>;
}
