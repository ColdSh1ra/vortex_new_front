import type { ContactWorker } from '../types/content';

const messengerIcons: Record<keyof ContactWorker['messenger_links'], string> = {
  telegram: '/icons/sm_black/telegram.svg',
  viber: '/icons/sm_black/viber.svg',
  whatsapp: '/icons/sm_black/whatsapp.svg',
  email: '/icons/sm_black/material-symbols_mail-rounded.svg',
};

const messengerLabels: Record<keyof ContactWorker['messenger_links'], string> = {
  telegram: 'Telegram',
  viber: 'Viber',
  whatsapp: 'WhatsApp',
  email: 'Email',
};

function getSafeMessengerLink(link: string) {
  try {
    const url = new URL(link);
    const allowedProtocols = ['https:', 'mailto:', 'viber:'];

    return allowedProtocols.includes(url.protocol) ? link : '#';
  } catch {
    return '#';
  }
}

function ContactWorkerCard({ worker }: { worker: ContactWorker }) {
  const phoneHref = `tel:${worker.phone.replace(/[^+\d]/g, '')}`;
  const messengerEntries = Object.entries(worker.messenger_links) as Array<
    [keyof ContactWorker['messenger_links'], string | undefined]
  >;

  return (
    <article className="contact-worker-card">
      <div className="contact-worker-profile">
        <h2 className="contact-worker-topic">{worker.contact_topic}</h2>
        <img
          className="contact-worker-photo"
          src={worker.photo_path}
          alt={worker.full_name}
        />
        <div className="contact-worker-identity">
          <p className="contact-worker-name">{worker.full_name}</p>
          <p className="contact-worker-role">{worker.role}</p>
        </div>
      </div>

      <a className="contact-worker-phone" href={phoneHref}>
        <img src="/icons/sm_black/phone.svg" alt="" aria-hidden="true" />
        <span>{worker.phone}</span>
      </a>

      <div className="contact-worker-messengers" aria-label={`Месенджери: ${worker.full_name}`}>
        {messengerEntries.map(([messenger, link]) => link && (
          <a
            key={messenger}
            href={getSafeMessengerLink(link)}
            aria-label={`${messengerLabels[messenger]} — ${worker.full_name}`}
            target={link.startsWith('https:') ? '_blank' : undefined}
            rel={link.startsWith('https:') ? 'noopener noreferrer' : undefined}
          >
            <img src={messengerIcons[messenger]} alt="" aria-hidden="true" />
          </a>
        ))}
      </div>
    </article>
  );
}

export default ContactWorkerCard;
