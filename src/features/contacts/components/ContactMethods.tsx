'use client';

import { useTranslations } from 'next-intl';

import { Phone, Send, Clock, MapPin, MessageCircle } from 'lucide-react';

export function ContactMethods() {
  const t = useTranslations('contacts');
  const contacts = [
    {
      icon: Phone,
      title: t('callTitle'),
      value: '+998 90 123 45 67',
      link: 'tel:+998901234567',
      desc: t('callHint'),
      action: t('callCta'),
    },
    {
      icon: Send,
      title: t('tgCta'),
      value: '@hge',
      link: 'https://t.me/hge',
      desc: t('tgHint'),
      action: t('tgTitle'),
    },
  ];

  return (
    <section id="contact-methods">
      <h2>{t('methodsTitle')}</h2>
      <p>{t('methodsLead')}</p>

      <div>
        {contacts.map((contact, i) => (
          <div key={i}>
            <contact.icon size={36} />
            <h3>{contact.title}</h3>
            <p>{contact.value}</p>
            <p>{contact.desc}</p>
            <a href={contact.link}>{contact.action}</a>
          </div>
        ))}
      </div>

      <div>
        <div>
          <Clock size={24} />
          <p>{t('hours')}</p>
          <p>Mon-Sun: 9 AM - 9 PM</p>
        </div>

        <div>
          <MapPin size={24} />
          <p>{t('location')}</p>
          <p>{t('locationValue')}</p>
        </div>

        <div>
          <MessageCircle size={24} />
          <p>{t('responseTime')}</p>
          <p>{t('responseValue')}</p>
        </div>
      </div>
    </section>
  );
}
