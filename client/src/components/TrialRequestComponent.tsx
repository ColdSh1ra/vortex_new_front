import { useMemo, useState } from 'react';
import { submitTrialRequest } from '../services/api';
import type { RequestedProduct, TrialRequestLocation } from '../services/api';
import InputComponent from './default/InputComponent';
import RecaptchaCheckbox from './default/RecaptchaCheckbox';

type TrialRequestComponentProps = {
  totalSum: number;
  requestedProduct?: RequestedProduct;
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
}: TrialRequestComponentProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [location, setLocation] = useState<TrialRequestLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaResetSignal, setRecaptchaResetSignal] = useState(0);

  const safeTotal = useMemo(() => {
    const numericTotal = Number(totalSum);
    return Number.isFinite(numericTotal) && numericTotal >= 0
      ? Math.round(numericTotal * 100) / 100
      : 0;
  }, [totalSum]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Ваш браузер не підтримує геолокацію.');
      return;
    }

    setLocationStatus('Очікуємо дозвіл на доступ до геолокації…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationStatus('Геолокацію буде додано до заявки.');
      },
      () => {
        setLocation(null);
        setLocationStatus('Геолокацію не надано. Заявку можна відправити без неї.');
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
      nextErrors.name = 'Введіть коректне ім’я (2–80 символів).';
    }

    if (
      !PHONE_PATTERN.test(normalizedPhone)
      || phoneDigits.length < 7
      || phoneDigits.length > 15
    ) {
      nextErrors.phone = 'Введіть коректний номер телефону.';
    }

    if (!recaptchaToken) {
      nextErrors.recaptcha = 'Підтвердьте, що ви не робот.';
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
      setSubmitStatus('Дякуємо! Заявку успішно відправлено.');
      setRecaptchaResetSignal((value) => value + 1);
    } catch (submitError) {
      setSubmitStatus(
        submitError instanceof Error
          ? submitError.message
          : 'Не вдалося відправити заявку. Спробуйте ще раз.',
      );
      setRecaptchaResetSignal((value) => value + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-container trial-request-section">
      <div className="trial-request-wrapper">
        <div className="trial-request-visual" aria-hidden="true">
          <img className={'logo-spin-animation'} src="/imgs/vortex_logo_large.svg" alt="vortex svg logo" />
        </div>

        <div className="trial-request-content">
          <header>
            <h2>Безкоштовні 14 днів!</h2>
            <p>Нема що думати, варто спробувати!</p>
          </header>

          <div className="trial-request-info">
            <h3>Безкоштовна версія функціонально нічим не відрізняється від платної!</h3>
            <p>
              Після завершення тест драйву, деякі дані можна буде видалити
              (тестові фінансові операції, замовлення, прийоми товару тощо),
              а деякі залишити (налаштування інтеграцій, імпорту прайсів,
              суб’єктів господарювання тощо)
            </p>
            <strong>Розрахована вартість: ${safeTotal}</strong>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <InputComponent
              id="trial-request-name"
              label="Як до вас звертатись?"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={80}
              placeholder="Введіть своє ім’я"
              value={name}
              error={errors.name}
              onChange={(event) => setName(event.target.value)}
            />

            <InputComponent
              id="trial-request-phone"
              label="Номер телефону"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={30}
              placeholder="+380"
              value={phone}
              error={errors.phone}
              onChange={(event) => setPhone(event.target.value)}
            />

            <div className="trial-request-location">
              <button type="button" onClick={requestLocation}>
                {location ? 'Геолокацію додано' : 'Додати мою геолокацію'}
              </button>
              {locationStatus && <span aria-live="polite">{locationStatus}</span>}
            </div>

            <RecaptchaCheckbox
              siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ''}
              onTokenChange={setRecaptchaToken}
              resetSignal={recaptchaResetSignal}
            />
            {errors.recaptcha && <span className="trial-request-recaptcha-error" role="alert">{errors.recaptcha}</span>}

            <button
              className="trial-request-submit"
              type="submit"
              disabled={isSubmitting || !import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            >
              {isSubmitting ? 'Відправляємо…' : 'Відправити'}
              <span aria-hidden="true">
                <img src="/icons/chevron-right-double.svg" alt="" />
              </span>
            </button>

            {submitStatus && <p className="trial-request-status" aria-live="polite">{submitStatus}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}

export default TrialRequestComponent;
