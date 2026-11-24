import { LANGUAGE_TAGS, useI18n } from '../../context/ContentContext';
import { useEffect, useRef } from 'react';

const ONLOAD_CALLBACK = '__vortexRecaptchaLoaded';
let recaptchaReady: Promise<void> | null = null;

/** Loads api.js once. Its script `load` event fires before grecaptcha.render exists (api.js
 * pulls in a second script), so readiness comes from Google's `onload` callback instead. */
function loadRecaptcha(): Promise<void> {
  recaptchaReady ??= new Promise<void>((resolve, reject) => {
    if (window.grecaptcha?.render) {
      resolve();
      return;
    }
    window[ONLOAD_CALLBACK] = () => resolve();
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?onload=${ONLOAD_CALLBACK}&render=explicit`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      script.remove();
      recaptchaReady = null;
      reject(new Error('reCAPTCHA failed to load'));
    };
    document.head.appendChild(script);
  });
  return recaptchaReady;
}

type RecaptchaCheckboxProps = {
  siteKey: string;
  onTokenChange: (token: string | null) => void;
  resetSignal: number;
};

function RecaptchaCheckbox({ siteKey, onTokenChange, resetSignal }: RecaptchaCheckboxProps) {
  const { t, language } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const callbackRef = useRef(onTokenChange);
  callbackRef.current = onTokenChange;

  useEffect(() => {
    if (!siteKey) {
      return;
    }

    let active = true;

    loadRecaptcha().then(() => {
      if (!active || !containerRef.current || widgetIdRef.current !== null || !window.grecaptcha) {
        return;
      }

      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        hl: LANGUAGE_TAGS[language],
        callback: (token: string) => callbackRef.current(token),
        'expired-callback': () => callbackRef.current(null),
        'error-callback': () => callbackRef.current(null),
      });
    }).catch(() => {
      // Blocked or offline: the form stays without a token and shows the captcha error on submit.
    });

    return () => {
      active = false;
    };
  }, [siteKey, language]);

  useEffect(() => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current);
      callbackRef.current(null);
    }
  }, [resetSignal]);

  if (!siteKey) {
    return <p className="recaptcha-configuration-error">{t('trial.captchaUnavailable')}</p>;
  }

  return <div className="recaptcha-checkbox" ref={containerRef} />;
}

export default RecaptchaCheckbox;
