'use client';
import { useState, useTransition } from 'react';
import { fullName } from '@/lib/format';

export function HealthFormClient({ inquiry, trial, action }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [smoking, setSmoking] = useState('no');
  const [alcohol, setAlcohol] = useState('no');
  const [mediaConsent, setMediaConsent] = useState('yes');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.target);
    fd.set('smoking', smoking);
    fd.set('alcohol', alcohol);
    fd.set('mediaConsent', mediaConsent);
    startTransition(async () => {
      const r = await action(fd);
      if (r?.ok === false) setError(r.error);
      else setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="form-public-success">
        <img src="/seal.svg" alt="Namma Combat" className="form-public-seal" />
        <h1 className="form-public-title">All set, {inquiry.firstName}.</h1>
        <p className="form-public-sub">Your health declaration is on file. See you on the floor.</p>
      </div>
    );
  }

  const trialDate = new Date(trial.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short' });

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-public-header">
        <img src="/seal.svg" alt="Namma Combat" className="form-public-seal" />
        <h1 className="form-public-title">Welcome, {inquiry.firstName}</h1>
        <p className="form-public-sub">
          Confirm your details below — takes about 90 seconds. We need this before your trial on <strong>{trialDate}</strong> at <strong>{trial.scheduledTime}</strong>.
        </p>
      </div>

      <Section label="Confirm">
        <ReadField label="Name" value={fullName(inquiry)} hint="Tell us if there's a typo" />
        <ReadField label="Phone" value={inquiry.phone} locked hint="Locked — this is the link you came from" />
        {Array.isArray(inquiry.interestedIn) && inquiry.interestedIn.length > 0 && <ReadField label="Interested in" value={inquiry.interestedIn.join(', ')} />}
        <ReadField label="Trial" value={`${trial.discipline} · ${trialDate} ${trial.scheduledTime}`} />
      </Section>

      <Section label="A few quick details">
        <Field name="dob" label="Date of birth" type="date" />
        <SelectField name="gender" label="Gender" options={['Male', 'Female', 'Prefer not to say']} required />
      </Section>

      <Section label="Emergency contact">
        <Field name="emergencyName" label="Name" placeholder="Who should we call if needed" required />
        <Field name="emergencyPhone" label="Phone" placeholder="+91" required />
        <SelectField name="emergencyRelation" label="Relation" options={['Spouse', 'Parent', 'Sibling', 'Friend', 'Other']} required />
      </Section>

      <Section label="Health">
        <TextArea name="medicalConditions" label="Any medical conditions?" placeholder="Asthma, diabetes, heart, BP — leave blank if none" />
        <TextArea name="injuries" label="Past or current injuries?" placeholder="Old fractures, surgeries, joint issues — leave blank if none" />
        <TextArea name="medications" label="Currently on any medication?" placeholder="Leave blank if none" />
        <ToggleField label="Do you smoke?" options={['no', 'occasionally', 'yes']} labels={['No', 'Occasionally', 'Yes']} value={smoking} onChange={setSmoking} />
        <ToggleField label="Do you drink alcohol?" options={['no', 'socially', 'regularly']} labels={['No', 'Socially', 'Regularly']} value={alcohol} onChange={setAlcohol} />
      </Section>

      <Section label="Consent">
        <div className="form-public-consent">
          <p>
            I confirm the information above is accurate. I understand combat sports involve physical risk and accept full responsibility for my participation. I will inform the coach immediately if I feel unwell.
          </p>
        </div>
        <ToggleField
          label="Photos / video — OK for the academy to share you on social and marketing?"
          options={['yes', 'no']}
          labels={['Yes, that’s fine', 'No, please don’t']}
          value={mediaConsent}
          onChange={setMediaConsent}
        />
        <Field name="consentSignedName" label="Type your full name as signature" placeholder={fullName(inquiry)} required />
        <p className="form-public-meta">Signed at submission · IP logged for our records</p>
      </Section>

      {error && <p className="form-public-error">{error}</p>}

      <button type="submit" disabled={isPending} className="form-public-submit">
        {isPending ? 'Submitting…' : 'Submit · Ready for trial'}
      </button>
      <p className="form-public-foot">Your information stays private — used only by your coach.</p>
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

function ReadField({ label, value, hint, locked }) {
  return (
    <div className={`form-public-read ${locked ? 'form-public-read-locked' : ''}`}>
      <div className="form-public-read-label">{label}</div>
      <div className="form-public-read-value">{value}{locked && <span className="form-public-lock">🔒</span>}</div>
      {hint && <div className="form-public-read-hint">{hint}</div>}
    </div>
  );
}

function Field({ name, label, type = 'text', placeholder, required }) {
  return (
    <div className="form-public-field">
      <label className="form-public-label">{label} {required && <span className="form-public-req">*</span>}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} className="form-public-input" />
    </div>
  );
}
function SelectField({ name, label, options, required }) {
  return (
    <div className="form-public-field">
      <label className="form-public-label">{label} {required && <span className="form-public-req">*</span>}</label>
      <select name={name} required={required} className="form-public-input">
        <option value="">Select…</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
function TextArea({ name, label, placeholder }) {
  return (
    <div className="form-public-field">
      <label className="form-public-label">{label}</label>
      <textarea name={name} placeholder={placeholder} rows={2} className="form-public-input" />
    </div>
  );
}
function ToggleField({ label, options, labels, value, onChange }) {
  return (
    <div className="form-public-field">
      <label className="form-public-label">{label}</label>
      <div className="form-public-toggle-row">
        {options.map((o, i) => (
          <button key={o} type="button" onClick={() => onChange(o)} className={`form-public-toggle ${value === o ? 'form-public-toggle-on' : ''}`}>
            {labels[i]}
          </button>
        ))}
      </div>
    </div>
  );
}
