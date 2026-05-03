'use client';
import { useState, useTransition } from 'react';
import { DESIGNATIONS, OFFERINGS, PRIMARY_GOALS, EXPERIENCE_LEVELS } from '@/lib/constants';
import { submitInquiry } from './actions';

export function InquireForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [interests, setInterests] = useState([]);

  function toggle(opt) {
    setInterests((arr) => (arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.target);
    interests.forEach((i) => fd.append('interestedIn', i));
    startTransition(async () => {
      const r = await submitInquiry(fd);
      if (r?.ok === false) setError(r.error);
      else setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="form-public-success">
        <img src="/seal.svg" alt="Namma Combat" className="form-public-seal" />
        <h1 className="form-public-title">Thanks — we&rsquo;ve got it.</h1>
        <p className="form-public-sub" style={{ marginTop: 12 }}>
          Someone from the team will WhatsApp you within a few hours to confirm a slot for your free trial. No spam, no upsell, just a real human.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-public-header">
        <img src="/seal.svg" alt="Namma Combat" className="form-public-seal" />
        <h1 className="form-public-title">Book your free trial</h1>
        <p className="form-public-sub">A quick 60 seconds. We&rsquo;ll WhatsApp to confirm your slot.</p>
      </div>

      <Section label="Who you are">
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: 8 }}>
          <SelectField name="designation" label="Title" options={['', ...DESIGNATIONS]} />
          <Field name="firstName" label="First name" required />
          <Field name="lastName" label="Last name" required />
        </div>
        <Field name="phone" label="Phone" placeholder="+91 98765 43210" required hint="We use WhatsApp to confirm — please use a WhatsApp number." />
      </Section>

      <Section label="What you&rsquo;re interested in (pick any)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {OFFERINGS.map((o) => (
            <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, padding: '8px 12px', border: '1px solid var(--border, #E0D6C8)', borderRadius: 6, cursor: 'pointer', background: interests.includes(o) ? 'rgba(154,53,32,0.06)' : 'transparent' }}>
              <input type="checkbox" checked={interests.includes(o)} onChange={() => toggle(o)} style={{ margin: 0 }} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section label="A bit more">
        <SelectField name="primaryGoal" label="Primary goal" options={['', ...PRIMARY_GOALS]} />
        <SelectField name="experience" label="Experience" options={['', ...EXPERIENCE_LEVELS]} />
      </Section>

      {error && <p className="form-public-error">{error}</p>}

      <button type="submit" disabled={isPending} className="form-public-submit">
        {isPending ? 'Sending…' : 'Book my free trial'}
      </button>
      <p className="form-public-foot">Privacy first — your info goes to the academy, never to anyone else.</p>
    </form>
  );
}

function Section({ label, children }) {
  return (
    <div className="form-public-section">
      <h3 className="form-public-section-label">{label}</h3>
      <div className="form-public-fields">{children}</div>
    </div>
  );
}
function Field({ name, label, type = 'text', placeholder, required, hint }) {
  return (
    <div className="form-public-field">
      <label className="form-public-label">{label} {required && <span className="form-public-req">*</span>}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} className="form-public-input" />
      {hint && <p className="form-public-meta" style={{ marginTop: 4 }}>{hint}</p>}
    </div>
  );
}
function SelectField({ name, label, options, required }) {
  return (
    <div className="form-public-field">
      <label className="form-public-label">{label} {required && <span className="form-public-req">*</span>}</label>
      <select name={name} required={required} className="form-public-input">
        {options.map((o) => <option key={o || '__'} value={o}>{o || 'Select…'}</option>)}
      </select>
    </div>
  );
}
