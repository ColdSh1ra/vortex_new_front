import { useEffect, useRef } from 'react';

type RecaptchaCheckboxProps = {
  siteKey: string;
  onTokenChange: (token: string | null) => void;
  resetSignal: number;
};

function RecaptchaCheckbox({ siteKey, onTokenChange, resetSignal }: RecaptchaCheckboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const callbackRef = useRef(onTokenChange);
  callbackRef.current = onTokenChange;

  useEffect(() => {
    if (!siteKey) {
      return;
    }

    let active = true;

    const renderWidget = () => {
      if (!active || !containerRef.current || widgetIdRef.current !== null || !window.grecaptcha) {
        return;
      }

      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => callbackRef.current(token),
        'expired-callback': () => callbackRef.current(null),
        'error-callback': () => callbackRef.current(null),
      });
    };

    if (window.grecaptcha) {
      renderWidget();
    } else {
      const scriptId = 'google-recaptcha-api';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener('load', renderWidget);
      return () => {
        active = false;
        script?.removeEventListener('load', renderWidget);
      };
    }

    return () => {
      active = false;
    };
  }, [siteKey]);

  useEffect(() => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current);
      callbackRef.current(null);
    }
  }, [resetSignal]);

  if (!siteKey) {
    return <p className="recaptcha-configuration-error">reCAPTCHA не налаштовано.</p>;
  }

  return <div className="recaptcha-checkbox" ref={containerRef} />;
}

export default RecaptchaCheckbox;
