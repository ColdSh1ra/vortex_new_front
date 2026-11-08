import { useLocation } from 'react-router-dom';
import { useI18n } from '../context/ContentContext';
import { useEffect, useMemo, useState } from 'react';
import { submitTrialRequest } from '../services/api';
import type { RequestedProduct, TrialRequestLocation } from '../services/api';
import InputComponent from './default/InputComponent';
import RecaptchaCheckbox from './default/RecaptchaCheckbox';
import type { WebsitePackage } from '../data/websitePlans';

type TrialRequestComponentProps = {
  totalSum: number;
  requestedProduct?: RequestedProduct;
  showCalculatedPrice?: boolean;
  websitePackage?: WebsitePackage;
};

type FormErrors = {
  name?: string;
  phone?: string;
  recaptcha?: string;
};

const NAME_PATTERN = /^[\p{L}\p{M} .'-]{2,80}$/u;
const NAME_LETTER_PATTERN = /\p{L}/u;
const PHONE_PATTERN = /^[+()\d\s-]{7,30}$/;

function TrialRequestComponent({
  totalSum,
  requestedProduct = 'vortex',
  showCalculatedPrice = true,
  websitePackage,
}: TrialRequestComponentProps) {
  const { t, language } = useI18n();
  const isTecDoc = requestedProduct === 'tecdoc';
  const pageLocation = useLocation();
  const sourcePage = pageLocation.pathname.startsWith('/car-service') ? 'car-service'
    : pageLocation.pathname.startsWith('/contact') ? 'contact'
      : pageLocation.pathname.startsWith('/websites') ? 'websites'
        : pageLocation.pathname.startsWith('/auto-dismantling') ? 'auto-dismantling'
          : pageLocation.pathname.startsWith('/tecdoc-license') ? 'tecdoc-license' : 'home';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [location, setLocation] = useState<TrialRequestLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaResetSignal, setRecaptchaResetSignal] = useState(0);

  useEffect(() => { setRecaptchaToken(null); }, [language]);

  const safeTotal = useMemo(() => {
    const numericTotal = Number(totalSum);
    return Number.isFinite(numericTotal) && numericTotal >= 0
      ? Math.round(numericTotal * 100) / 100
      : 0;
  }, [totalSum]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('trial.locationUnsupported');
      return;
    }

    setLocationStatus('trial.locationWaiting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationStatus('trial.locationSuccess');
      },
      () => {
        setLocation(null);
        setLocationStatus('trial.locationDenied');
      },
      {
        enableHighAccuracy: false,
        timeout: 7000,
        maximumAge: 300000,
      },
    );
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const normalizedName = name.normalize('NFKC').trim().replace(/\s+/g, ' ');
    const normalizedPhone = phone.normalize('NFKC').trim();
    const phoneDigits = normalizedPhone.replace(/\D/g, '');

    if (!NAME_PATTERN.test(normalizedName) || !NAME_LETTER_PATTERN.test(normalizedName)) {
      nextErrors.name = 'trial.nameError';
    }

    if (
      !PHONE_PATTERN.test(normalizedPhone)
      || phoneDigits.length < 7
      || phoneDigits.length > 15
    ) {
      nextErrors.phone = 'trial.phoneError';
    }

    if (!recaptchaToken) {
      nextErrors.recaptcha = 'trial.captchaError';
    }

    setErrors(nextErrors);
    return {
      valid: Object.keys(nextErrors).length === 0,
      normalizedName,
      normalizedPhone,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus('');

    const validation = validate();
    if (!validation.valid || !recaptchaToken) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitTrialRequest({
        source_page: sourcePage,
        language,
        ...(sourcePage === 'websites' && websitePackage ? { website_package: websitePackage } : {}),
        requested_product: requestedProduct,
        name: validation.normalizedName,
        phone: validation.normalizedPhone,
        total_sum: safeTotal,
        recaptcha_token: recaptchaToken,
        location,
      });

      setName('');
      setPhone('');
      setLocation(null);
      setLocationStatus('');
      setErrors({});
      setSubmitStatus(isTecDoc ? 'tecdoc.success' : 'trial.success');
      setRecaptchaResetSignal((value) => value + 1);
    } catch (submitError) {
      setSubmitStatus(
        submitError && typeof submitError === 'object' && 'status' in submitError && submitError.status === 503
          ? 'trial.unavailable'
          : 'trial.error',
      );
      setRecaptchaResetSignal((value) => value + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-container trial-request-section" id="trial-request">
      <div className="trial-request-wrapper">
        {isTecDoc ? <aside className="tecdoc-license-price">
          <p className="tecdoc-eyebrow">TecDoc Web Catalog 3.0</p>
          <p className="tecdoc-license-price-value">25€</p>
          <p className="tecdoc-license-price-period">{t('tecdoc.pricePeriod')}</p>
          <p className="tecdoc-license-price-terms">{t('tecdoc.paymentTerms')}</p>
          <p className="tecdoc-license-price-trial">{t('tecdoc.trialTerms')}</p>
        </aside> : <div className="trial-request-visual" aria-hidden="true">
          <img className={'logo-spin-animation'} src="/imgs/vortex_logo_large.svg" alt="" />
        </div>}

        <div className="trial-request-content">
          <header>
            <h2>{t(isTecDoc ? 'tecdoc.buyLicense' : 'trial.title')}</h2>
            <p>{t(isTecDoc ? 'tecdoc.formDescription' : 'trial.subtitle')}</p>
          </header>

          <div className="trial-request-info">
            <h3>{t(isTecDoc ? 'tecdoc.trialBadge' : 'trial.infoTitle')}</h3>
            <p>{t(isTecDoc ? 'tecdoc.trialTerms' : 'trial.info')}</p>
            {showCalculatedPrice && !isTecDoc && <strong>{t('trial.price', { total: safeTotal })}</strong>}
            {websitePackage && <strong aria-live="polite">{t('websites.selectedPlan', { name: t(`websites.plan.${websitePackage}`) })}</strong>}
          </div>

          <form onSubmit={handleSubmit} aria-label={t(isTecDoc ? 'tecdoc.buyLicense' : 'trial.title')} noValidate>
            <InputComponent
              id="trial-request-name"
              label={t('trial.name')}
              name="name"
              type="text"
              autoComplete="name"
              maxLength={80}
              placeholder={t('trial.namePlaceholder')}
              value={name}
              error={errors.name ? t(errors.name) : undefined}
              onChange={(event) => setName(event.target.value)}
            />

            <InputComponent
              id="trial-request-phone"
              label={t('trial.phone')}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={30}
              placeholder={t('trial.phonePlaceholder')}
              value={phone}
              error={errors.phone ? t(errors.phone) : undefined}
              onChange={(event) => setPhone(event.target.value)}
            />

            {!isTecDoc && <div className="trial-request-location">
              <button type="button" onClick={requestLocation}>
                {t(location ? 'trial.locationAdded' : 'trial.location')}
              </button>
              {locationStatus && <span aria-live="polite">{t(locationStatus)}</span>}
            </div>}

            <RecaptchaCheckbox
              key={language}
              siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ''}
              onTokenChange={setRecaptchaToken}
              resetSignal={recaptchaResetSignal}
            />
            {errors.recaptcha && <span className="trial-request-recaptcha-error" role="alert">{t(errors.recaptcha)}</span>}

            <button
              className="trial-request-submit"
              type="submit"
              disabled={isSubmitting || !import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            >
              {t(isSubmitting ? 'trial.sending' : 'trial.send')}
              <span aria-hidden="true">
                <img src="/icons/chevron-right-double.svg" alt="" />
              </span>
            </button>

            {submitStatus && <p className="trial-request-status" aria-live="polite">{t(submitStatus)}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}

export default TrialRequestComponent;
