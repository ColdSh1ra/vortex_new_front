import { useState } from 'react';
import { useI18n } from '../../context/ContentContext';

/** The preview flag comes from the same request on the server and client. */
export default function CmsPreviewNotice() {
  const { preview } = useI18n();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!preview) return null;

  const exit = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch('/api/content/preview/end', { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error('preview_exit_failed');
      if (window.location.pathname.startsWith('/blog/preview/')) window.location.assign('/blog' + window.location.search);
      else window.location.reload();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };
  return <aside className="cms-preview-notice" aria-label="CMS preview">
    <span>CMS: попередній перегляд чернетки</span>
    <button type="button" disabled={busy} onClick={() => { void exit(); }}>{busy ? 'Завершення…' : 'Вийти з перегляду'}</button>
    {failed && <span role="alert">Не вдалося завершити перегляд. Спробуйте ще раз.</span>}
  </aside>;
}
