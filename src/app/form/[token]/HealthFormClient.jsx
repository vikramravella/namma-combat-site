'use client';
import { useState, useTransition } from 'react';
import { fullName } from '@/lib/format';
import { DatePicker } from '@/components/DatePicker';

export function HealthFormClient({ inquiry, trial, action }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [smoking, setSmoking] = useState('no');
  const [alcohol, setAlcohol] = useState('no');
  const [mediaConsent, setMediaConsent] = useState('yes');
  const [dob, setDob] = useState('');
  const [editName, setEditName] = useState(fullName(inquiry));

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!dob) { setError('Date of birth is required.'); return; }
    if (!editName.trim()) { setError('Name is required.'); return; }
    const fd = new FormData(e.target);
    fd.set('dob', dob);
    fd.set('smoking', smoking);
    fd.set('alcohol', alcohol);
    fd.set('mediaConsent', mediaConsent);
    fd.set('fullName', editName.trim());
    startTransition(async () => {
      const r = await action(fd);
      if (r?.ok === false) setError(r.error);
      else setSuccess(true);
    });
  }

  const trialDate = new Date(trial.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short' });

  if (success) {
    return (
      <div className="form-public-success">
        <img src="/seal.svg" alt="Namma Combat" className="form-public-seal" />
        <h1 className="form-public-title">You&rsquo;re registered, {inquiry.firstName}.</h1>
        <p className="form-public-sub" style={{ marginTop: 12 }}>
          Your trial session is scheduled for{' '}
          <strong>{trial.discipline}</strong> on{' '}
          <strong>{trialDate}</strong> at{' '}
          <strong>{trial.scheduledTime}</strong>
          {trial.coach?.name ? <> with <strong>{trial.coach.name}</strong></> : null}.
        </p>
        <p className="form-public-meta" style={{ marginTop: 24, fontStyle: 'italic', letterSpacing: 2, textTransform: 'uppercase', fontSize: 12 }}>
          Skill · Strength · Sanctuary
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-public-header">
        <img src="/seal.svg" alt="Namma Combat" className="form-public-seal" />
        <h1 className="form-public-title">Welcome, {inquiry.firstName}</h1>
        <p className="form-public-sub">Confirm your details.</p>
      </div>

      <Section label="Confirm">
        <div className="form-public-field">
          <label className="form-public-label">Name <span className="form-public-req">*</span></label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="form-public-input"
            required
          />
          <div className="form-public-read-hint">Fix any typo — we&rsquo;ll update our records.</div>
        </div>
        <ReadField label="Phone" value={inquiry.phone} locked hint="Locked — this is the link you came from" />
        {Array.isArray(inquiry.interestedIn) && inquiry.interestedIn.length > 0 && <ReadField label="Interested in" value={inquiry.interestedIn.join(', ')} />}
        <ReadField label="Trial" value={`${trial.discipline} · ${trialDate} ${trial.scheduledTime}`} />
      </Section>

      <Section label="A few quick details">
        <div className="form-public-field">
          <label className="form-public-label">Date of birth <span className="form-public-req">*</span></label>
          <DatePicker value={dob} onChange={setDob} className="form-public-input" placeholder="Pick your date of birth" required />
        </div>
        <SelectField name="gender" label="Gender" options={['Male', 'Female', 'Prefer not to say']} required />
      </Section>

      <Section label="Emergency contact">
        <Field name="emergencyName" label="Name" placeholder="Who should we call if needed" required />
        <Field name="emergencyPhone" label="Phone" placeholder="+91" required />
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
