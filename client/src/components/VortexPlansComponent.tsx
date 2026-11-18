import StickyHeading from './default/StickyHeading';
import { useI18n, LANGUAGE_TAGS } from '../context/ContentContext';
import type { Language, VortexPricingPlan } from '../types/content';
import Link from './default/LocalizedLink';
import ChevronCircle from './default/ChevronCircle';

const billingLabels: Record<Language, Record<VortexPricingPlan['billing_period'], string>> = {
  ua: { monthly: 'на місяць', yearly: 'на рік', one_time: 'разова оплата' },
  cz: { monthly: 'měsíčně', yearly: 'ročně', one_time: 'jednorázová platba' },
  sk: { monthly: 'mesačne', yearly: 'ročne', one_time: 'jednorazová platba' },
  en: { monthly: 'per month', yearly: 'per year', one_time: 'one-time payment' },
  pl: { monthly: 'miesięcznie', yearly: 'rocznie', one_time: 'płatność jednorazowa' },
};

function planTarget(target: string) {
  if (target.startsWith('#')) return `/${target}`;
  if (target.startsWith('/') && !target.startsWith('//')) return target;
  if (/^(https:\/\/|mailto:|tel:)/i.test(target)) return target;
  return null;
}

function validPlan(plan: VortexPricingPlan) {
  return plan.id.trim() && plan.name.trim() && plan.cta_text.trim() && planTarget(plan.cta_target)
    && (plan.price === null || Number.isFinite(plan.price) && plan.price >= 0)
    && (plan.price === null || plan.currency.trim())
    && ['monthly', 'yearly', 'one_time'].includes(plan.billing_period);
}

type VortexPlansProps = { onPlanSelect?: (planId: string) => void };

/** Nothing is published until approved plans are supplied and visibility is enabled. */
export default function VortexPlansComponent({ onPlanSelect }: VortexPlansProps) {
  const { content, language } = useI18n();
  const section = content?.homepage.vortex_pricing_section;
  if (section?.visible !== true || !section.plans.length) return null;
  const plans = section.plans.filter(validPlan);
  if (!plans.length) return null;

  const formatPrice = new Intl.NumberFormat(LANGUAGE_TAGS[language], { maximumFractionDigits: 2 });

  return (
    <section className="section-container vortex-plans-section" id="vortex-plans" aria-labelledby="vortex-plans-heading">
      <div className="vortex-plans-wrapper">
        <header className="vortex-plans-intro">
          <StickyHeading id="vortex-plans-heading">{section.section_title}</StickyHeading>
          {section.section_description && <p>{section.section_description}</p>}
        </header>
        <div className="vortex-plans-grid">
          {plans.map(plan => (
            <article className={`vortex-plan${plan.highlighted ? ' is-highlighted' : ''}`} key={plan.id} aria-labelledby={`vortex-plan-${plan.id}`}>
              <h3 id={`vortex-plan-${plan.id}`}>{plan.name}</h3>
              {plan.description && <p className="vortex-plan-description">{plan.description}</p>}
              {plan.price !== null && <p className="vortex-plan-price">
                <strong>{formatPrice.format(plan.price)} <span>{plan.currency}</span></strong>
                <span>{section.billing_labels?.[plan.billing_period] ?? billingLabels[language][plan.billing_period]}</span>
              </p>}
              {plan.features.length > 0 && <ul>{plan.features.map((feature, index) => <li key={`${plan.id}-${index}`}>{feature}</li>)}</ul>}
              <Link className="vortex-plan-choose" to={planTarget(plan.cta_target)!} onClick={() => onPlanSelect?.(plan.id)}>
                {plan.cta_text}<ChevronCircle />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
