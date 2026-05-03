import { InquireForm } from './InquireForm';
import '../form/[token]/form.css';

export const metadata = {
  title: 'Book your free trial — Namma Combat',
  description: 'Tell us about you and we will WhatsApp to confirm your free trial slot at Namma Combat Academy, Koramangala, Bangalore.',
  robots: { index: true, follow: true },
};

export default function InquirePage() {
  return (
    <main className="form-public-wrap">
      <div className="form-public-frame">
        <InquireForm />
      </div>
    </main>
  );
}
