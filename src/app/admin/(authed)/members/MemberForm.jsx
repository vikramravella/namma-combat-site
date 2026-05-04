'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DESIGNATIONS, MEMBER_STATUSES, SKILL_LEVELS, DISCIPLINES_COMBAT, DISCIPLINES_SANCTUARY } from '@/lib/constants';
import { DatePicker } from '@/components/DatePicker';

const ALL_DISCIPLINES = [...DISCIPLINES_COMBAT.filter((d) => d !== 'Workshop'), ...DISCIPLINES_SANCTUARY.filter((d) => d !== 'Workshop')];

export function MemberForm({ member, action, deleteAction }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialDisc = (member.disciplines || '').split(',').map((s) => s.trim()).filter(Boolean);
  const [disciplines, setDisciplines] = useState(initialDisc);
  const [dob, setDob] = useState(member.dob ? new Date(member.dob).toISOString().slice(0, 10) : '');

  function toggleDisc(d) {
    setDisciplines((arr) => arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]);
  }

  function handleSubmit(formData) {
    setError(''); setSuccess('');
    formData.set('disciplines', disciplines.join(', '));
    startTransition(async () => {
      const r = await action(member.id, formData);
      if (r?.ok === false) setError(r.error);
      else if (r?.ok === true) { setSuccess('Saved.'); router.refresh(); }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete ${member.firstName} ${member.lastName}? This removes their member record (plans + receipts cascade).`)) return;
    startTransition(async () => {
      const r = await deleteAction(member.id);
      if (r?.ok === false) setError(r.error);
    });
  }

  return (
    <form action={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}
      {success && <p className="adm-success">{success}</p>}

      <div className="adm-card">
        <h2 className="adm-card-title">Identity</h2>
        <div className="adm-form">
          <div className="adm-form-row" style={{ gridTemplateColumns: '110px 1fr 1fr' }}>
            <Select label="Designation" name="designation" defaultValue={member.designation || ''} options={[['', '—'], ...DESIGNATIONS.map((d) => [d, d])]} />
            <Field label="First name *" name="firstName" defaultValue={member.firstName} required />
            <Field label="Last name *" name="lastName" defaultValue={member.lastName} required />
          </div>
          <div className="adm-form-row">
            <Field label="Phone *" name="phone" defaultValue={member.phone} required />
            <div className="adm-field">
              <label className="adm-label">DOB</label>
              <DatePicker value={dob} onChange={setDob} name="dob" />
            </div>
          </div>
          <div className="adm-form-row">
            <Select label="Gender" name="gender" defaultValue={member.gender || ''} options={[['', '—'], ['M', 'Male'], ['F', 'Female'], ['Other', 'Other']]} />
            <div />
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Training</h2>
        <div className="adm-form">
          <div className="adm-form-row">
            <Select label="Primary discipline" name="primaryDiscipline" defaultValue={member.primaryDiscipline || ''} options={[['', '—'], ...ALL_DISCIPLINES.map((d) => [d, d])]} />
            <Select label="Skill level" name="skillLevel" defaultValue={member.skillLevel || 'Beginner'} options={SKILL_LEVELS.map((s) => [s.key, s.label])} />
          </div>
          <div className="adm-field">
            <label className="adm-label">All disciplines they train</label>
            <div className="prv-chips">
              {ALL_DISCIPLINES.map((d) => (
                <button key={d} type="button" onClick={() => toggleDisc(d)} className={`prv-chip ${disciplines.includes(d) ? 'prv-chip-on' : ''}`}>
                  {d}
                </button>
              ))}
            </div>
            <span className="adm-help">Toggle the sports they currently train. Stored as comma-list.</span>
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Emergency contact</h2>
        <div className="adm-form">
          <div className="adm-form-row">
            <Field label="Name" name="emergencyName" defaultValue={member.emergencyName} />
            <Field label="Phone" name="emergencyPhone" defaultValue={member.emergencyPhone} />
          </div>
          <Field label="Relationship" name="emergencyRelation" defaultValue={member.emergencyRelation} placeholder="spouse, parent, sibling…" />
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Health & status</h2>
        <div className="adm-form">
          <Textarea label="Medical conditions" name="medicalConditions" defaultValue={member.medicalConditions} placeholder="Asthma, diabetes, BP, heart, allergies — leave blank if none" />
          <Textarea label="Injuries (past or current)" name="injuries" defaultValue={member.injuries} placeholder="Old fractures, surgeries, joint issues — leave blank if none" />
          <Textarea label="Medications" name="medications" defaultValue={member.medications} placeholder="Currently on any medication? — leave blank if none" />
          <Textarea label="Additional staff notes" name="medicalNotes" defaultValue={member.medicalNotes} placeholder="Coach observations not covered above (e.g. limp seen during May trial)" />
          <div className="adm-form-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input type="checkbox" name="criticalHealthFlag" defaultChecked={member.criticalHealthFlag} value="true" />
              <span>⚠ Critical health flag (coach attention)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input type="checkbox" name="smokes" defaultChecked={member.smokes} value="true" />
              <span>Smoker</span>
            </label>
          </div>
          <Select label="Media consent (photos / video)" name="mediaConsent" defaultValue={member.mediaConsent === null ? '' : String(member.mediaConsent)} options={[['', '— not asked yet —'], ['true', 'Yes — OK to use'], ['false', 'No — do not use']]} />
          <Select label="Member status" name="status" defaultValue={member.status} options={MEMBER_STATUSES.map((s) => [s.key, s.label])} />
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Internal notes</h2>
        <Textarea label="" name="notes" defaultValue={member.notes} />
      </div>

      <div className="adm-form-actions">
        <button type="button" onClick={handleDelete} disabled={isPending} className="adm-btn adm-btn-danger">Delete</button>
        <div className="adm-spacer" />
        <Link href="/admin/members" className="adm-btn adm-btn-secondary">Cancel</Link>
        <button type="submit" disabled={isPending} className="adm-btn">{isPending ? 'Saving…' : 'Save changes'}</button>
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
