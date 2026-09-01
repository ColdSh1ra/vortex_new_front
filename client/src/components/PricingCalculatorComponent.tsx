import { useEffect, useMemo, useRef, useState } from 'react';
import { useInitialContent } from '../context/ContentContext';
import { getContent } from '../services/api';
import type { PricingCalculatorSettings } from '../types/content';
import SelectComponent from './default/SelectComponent';

type PricingCalculatorComponentProps = {
  onTotalChange?: (total: number) => void;
};

type CounterProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function QuantityCounter({ id, label, value, onChange }: CounterProps) {
  return (
    <div className="pricing-counter">
      <span className="pricing-counter-label">{label}</span>
      <div className="pricing-counter-control">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          aria-label={`Зменшити: ${label}`}
        >
          <img src="/icons/sm_black/minus.svg" alt="" />
        </button>
        <output id={id} aria-live="polite">{value}</output>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`Збільшити: ${label}`}
        >
          <img src="/icons/sm_black/plus.svg" alt="" />
        </button>
      </div>
    </div>
  );
}

function PricingCalculatorComponent({ onTotalChange }: PricingCalculatorComponentProps) {
  const initialSettings = useInitialContent()?.settings.pricing_calculator ?? null;
  const [settings, setSettings] = useState<PricingCalculatorSettings | null>(initialSettings);
  const [managerCount, setManagerCount] = useState(initialSettings?.default_manager_count ?? 0);
  const [storeCount, setStoreCount] = useState(initialSettings?.default_store_count ?? 0);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(
    initialSettings?.integrations
      .filter((integration) => integration.selected_by_default)
      .map((integration) => integration.id) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (settings) {
      return;
    }

    getContent()
      .then((content) => {
        const loadedSettings = content.settings.pricing_calculator;
        setSettings(loadedSettings);
        setManagerCount(loadedSettings.default_manager_count);
        setStoreCount(loadedSettings.default_store_count);
        setSelectedIntegrations(
          loadedSettings.integrations
            .filter((integration) => integration.selected_by_default)
            .map((integration) => integration.id),
        );
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Unknown error');
      });
  }, [settings]);

  const totals = useMemo(() => {
    if (!settings) {
      return { monthly: 0, oneTime: 0, total: 0 };
    }

    const selected = settings.integrations.filter((integration) => (
      selectedIntegrations.includes(integration.id)
    ));
    const monthlyIntegrations = selected
      .filter((integration) => integration.billing_period === 'monthly')
      .reduce((sum, integration) => sum + integration.price, 0);
    const oneTimeIntegrations = selected
      .filter((integration) => integration.billing_period === 'one_time')
      .reduce((sum, integration) => sum + integration.price, 0);
    const quantityDifference = (
      managerCount - settings.default_manager_count
      + storeCount - settings.default_store_count
    );
    const monthly = Math.max(
      0,
      settings.base_monthly_price
        + monthlyIntegrations
        + (quantityDifference * settings.increment),
    );
    const oneTime = oneTimeIntegrations;

    return { monthly, oneTime, total: monthly + oneTime };
  }, [managerCount, selectedIntegrations, settings, storeCount]);

  useEffect(() => {
    if (!settings) {
      return;
    }

    onTotalChange?.(totals.total);
    sectionRef.current?.dispatchEvent(new CustomEvent('pricing-total-change', {
      bubbles: true,
      detail: totals,
    }));
  }, [onTotalChange, settings, totals]);

  const toggleIntegration = (integrationId: string, selected: boolean) => {
    setSelectedIntegrations((current) => (
      selected
        ? [...current, integrationId]
        : current.filter((id) => id !== integrationId)
    ));
  };

  return (
    <section className="section-container pricing-calculator-section" ref={sectionRef}>
      {error && <p className="pricing-calculator-status">{error}</p>}

      {settings && (
        <div className="pricing-calculator-wrapper">
          <h2 className="pricing-calculator-title">Ціни</h2>

          <div className="pricing-calculator-grid">
            <div className="pricing-calculator-options">
              <h3>Ваша вартість користування VORTEX</h3>

              <div className="pricing-calculator-fields">
                <QuantityCounter
                  id="manager-count"
                  label="Оберіть кількість акаунтів для менеджерів"
                  value={managerCount}
                  onChange={setManagerCount}
                />
                <QuantityCounter
                  id="store-count"
                  label="Вкажіть кількість філій"
                  value={storeCount}
                  onChange={setStoreCount}
                />

                <div className="pricing-integration-options">
                  {settings.integrations.map((integration) => (
                    <SelectComponent
                      id={`pricing-${integration.id}`}
                      key={integration.id}
                      label={`Інтеграція з ${integration.label}`}
                      selected={selectedIntegrations.includes(integration.id)}
                      onChange={(selected) => toggleIntegration(integration.id, selected)}
                    />
                  ))}
                </div>

                <div className="pricing-included-options">
                  {settings.included_features.map((feature, index) => (
                    <SelectComponent
                      id={`pricing-included-${index}`}
                      key={feature}
                      label={feature}
                      selected
                      readOnly
                    />
                  ))}
                </div>
              </div>
            </div>

            <aside className="pricing-calculator-summary">
              <img src="/bgs/logo2.svg" alt="" aria-hidden="true" />
              <div>
                <p><strong>{settings.currency}{totals.monthly}</strong> на місяць</p>
                <output aria-live="polite">{settings.currency}{totals.oneTime} одноразова плата</output>
              </div>
            </aside>
          </div>

          <div className="pricing-cta pricing-cta-trial">
            <h3>Спробуйте VORTEX на 14 днів безкоштовно!</h3>
            <p>Повноцінне користування системою без оплати</p>
            <a href="/contact">Спробувати Безкоштовно</a>
          </div>

          <div className="pricing-cta pricing-cta-demo">
            <h3>Замовте демонстрацію демо-версії просто зараз!</h3>
            <p>Відео-демонстрація користування системою від наших спеціалістів</p>
            <a href="/contact">Спробувати Демо</a>
          </div>
        </div>
      )}
    </section>
  );
}

export default PricingCalculatorComponent;
