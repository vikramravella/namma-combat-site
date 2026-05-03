'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DESIGNATIONS, INQUIRY_STAGES, SOURCES, PRIMARY_GOALS, EXPERIENCE_LEVELS, PREFERRED_TIMES } from '@/lib/constants';

export function InquiryForm({ inquiry, action, deleteAction, mode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleSubmit(formData) {
    setError(''); setSuccess('');
    startTransition(async () => {
      const r = mode === 'create' ? await action(formData) : await action(inquiry.id, formData);
      if (r?.ok === false) setError(r.error);
      else if (r?.ok === true) { setSuccess('Saved.'); router.refresh(); }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete this inquiry permanently?`)) return;
    startTransition(async () => {
      const r = await deleteAction(inquiry.id);
      if (r?.ok === false) setError(r.error);
    });
  }

  const i = inquiry || {};

  return (
    <form action={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}
      {success && <p className="adm-success">{success}</p>}

      <div className="adm-card">
        <h2 className="adm-card-title">Identity</h2>
        <div className="adm-form">
          <div className="adm-form-row" style={{ gridTemplateColumns: '110px 1fr 1fr' }}>
            <Select label="Designation" name="designation" defaultValue={i.designation || ''} options={[['', '—'], ...DESIGNATIONS.map((d) => [d, d])]} />
            <Field label="First name *" name="firstName" defaultValue={i.firstName} required />
            <Field label="Last name *" name="lastName" defaultValue={i.lastName} required />
          </div>
          <Field label="Phone *" name="phone" defaultValue={i.phone} required placeholder="+91 98765 43210" />
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">What they want</h2>
        <div className="adm-form">
          <Field label="Interested in" name="interestedIn" defaultValue={i.interestedIn} placeholder="e.g. Boxing, BJJ, Kids MMA" />
          <div className="adm-form-row">
            <Select label="Primary goal" name="primaryGoal" defaultValue={i.primaryGoal || ''} options={[['', '—'], ...PRIMARY_GOALS.map((g) => [g, g])]} />
            <Select label="Experience" name="experience" defaultValue={i.experience || ''} options={[['', '—'], ...EXPERIENCE_LEVELS.map((e) => [e, e])]} />
          </div>
          <div className="adm-form-row">
            <Select label="Preferred time" name="preferredTime" defaultValue={i.preferredTime || ''} options={[['', '—'], ...PREFERRED_TIMES.map((t) => [t, t])]} />
            <Field label="Area" name="area" defaultValue={i.area} placeholder="e.g. Koramangala, HSR" />
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Source & stage</h2>
        <div className="adm-form">
          <div className="adm-form-row">
            <Select label="Source" name="source" defaultValue={i.source || ''} options={[['', '—'], ...SOURCES.map((s) => [s.key, s.label])]} />
            <Select label="Stage" name="stage" defaultValue={i.stage || 'new'} options={INQUIRY_STAGES.map((s) => [s.key, s.label])} />
          </div>
          <Field label="Source details" name="sourceDetails" defaultValue={i.sourceDetails} placeholder="Referrer name, ad campaign, coach page name…" />
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Notes</h2>
        <Textarea label="" name="notes" defaultValue={i.notes} placeholder="Anything useful for the next conversation" />
      </div>

      <div className="adm-form-actions">
        {mode === 'edit' && (
          <>
            <button type="button" onClick={handleDelete} disabled={isPending} className="adm-btn adm-btn-danger">Delete</button>
            <div className="adm-spacer" />
          </>
        )}
        <Link href="/admin/inquiries" className="adm-btn adm-btn-secondary">Cancel</Link>
        <button type="submit" disabled={isPending} className="adm-btn">
          {isPending ? 'Saving…' : mode === 'create' ? 'Create inquiry' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, type = 'text', defaultValue, required, placeholder }) {
  return (
    <div className="adm-field">
      <label className="adm-label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue || ''} required={required} placeholder={placeholder} className="adm-input" />
    </div>
  );
}

function Textarea({ label, name, defaultValue, placeholder }) {
  return (
    <div className="adm-field">
      {label && <label className="adm-label" htmlFor={name}>{label}</label>}
      <textarea id={name} name={name} defaultValue={defaultValue || ''} placeholder={placeholder} className="adm-textarea" rows={3} />
    </div>
  );
}

function Select({ label, name, defaultValue, options }) {
  return (
    <div className="adm-field">
      <label className="adm-label" htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="adm-select">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
