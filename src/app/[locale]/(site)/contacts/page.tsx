import { ContactHero } from '@/features/contacts/components/ContactHero';
import { ContactMethods } from '@/features/contacts/components/ContactMethods';
import { ContactFormBlock } from '@/features/contacts/components/ContactFormBlock';
import { FAQPreview } from '@/features/contacts/components/FAQPreview';
import { QuickLinks } from '@/features/contacts/components/QuickLinks';

export default async function ContactsPage() {
  return (
    <main>
      <ContactHero />
      <ContactMethods />
      <ContactFormBlock />
      <QuickLinks />
      <FAQPreview />
    </main>
  );
}