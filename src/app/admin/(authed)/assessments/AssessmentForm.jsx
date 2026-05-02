'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ASSESSMENT_OPTIONS } from '@/lib/constants';
import { saveAssessment, deleteAssessment } from './actions';

export function AssessmentForm({ member, coaches, assessment, mode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const a = assessment || {};

  // Multi-selects → local state (then serialised on submit)
  const [spinePosture, setSpinePosture] = useState((a.spinePosture || '').split(',').filter(Boolean));
  const [scapulaPosition, setScapulaPosition] = useState((a.scapulaPosition || '').split(',').filter(Boolean));
  const [headNeckPosition, setHeadNeckPosition] = useState((a.headNeckPosition || '').split(',').filter(Boolean));
  const [hasMedical, setHasMedical] = useState(a.hasMedicalCondition || false);
  const [ribFlare, setRibFlare] = useState(a.spineRibFlare || false);

  function toggleMulti(arr, setter, val) {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    const fd = new FormData(e.target);
    fd.set('memberId', member.id);
    fd.set('spinePosture', spinePosture.join(','));
    fd.set('scapulaPosition', scapulaPosition.join(','));
    fd.set('headNeckPosition', headNeckPosition.join(','));
    fd.set('hasMedicalCondition', String(hasMedical));
    fd.set('spineRibFlare', String(ribFlare));
    startTransition(async () => {
      const r = await saveAssessment(fd, mode === 'edit' ? { id: assessment.id } : {});
      if (r?.ok === false) { setError(r.error); return; }
      setSuccess('Saved.');
      if (mode === 'create' && r.id) router.push(`/admin/assessments/${r.id}`);
      else router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm('Delete this assessment? This cannot be undone.')) return;
    startTransition(async () => {
      const r = await deleteAssessment(assessment.id);
      if (r?.ok === false) setError(r.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}
      {success && <p className="adm-success">{success}</p>}

      <div className="adm-card">
        <h2 className="adm-card-title">Header</h2>
        <div className="adm-form">
          <div className="adm-form-row">
            <div className="adm-field">
              <label className="adm-label">Date</label>
              <input type="date" name="assessedAt" defaultValue={a.assessedAt ? new Date(a.assessedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)} className="adm-input" />
            </div>
            <div className="adm-field">
              <label className="adm-label">Coach</label>
              <select name="coachId" defaultValue={a.coachId || ''} className="adm-select">
                <option value="">— pick —</option>
                {coaches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="adm-form-row">
            <div className="adm-field">
              <label className="adm-label">Age (at time of assessment)</label>
              <input type="number" name="ageAtTime" defaultValue={a.ageAtTime || ''} className="adm-input" />
            </div>
            <div className="adm-field">
              <label className="adm-label">Gender</label>
              <select name="genderAtTime" defaultValue={a.genderAtTime || (member.gender || '')} className="adm-select">
                <option value="">— pick —</option>
                {ASSESSMENT_OPTIONS.gender.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={hasMedical} onChange={(e) => setHasMedical(e.target.checked)} />
            <span>Has a medical condition</span>
          </label>
          {hasMedical && (
            <div className="adm-field">
              <label className="adm-label">List of conditions</label>
              <textarea name="medicalConditionList" defaultValue={a.medicalConditionList || ''} className="adm-textarea" rows={2} />
            </div>
          )}
        </div>
      </div>

      <Region label="1 · Ankle & Foot">
        <div className="adm-form-row">
          <Numeric name="ankleDorsiflexionCm" label="Dorsiflexion (cm, knee-to-wall)" defaultValue={a.ankleDorsiflexionCm} />
          <Picklist name="ankleArch" label="Arch" options={ASSESSMENT_OPTIONS.ankleArch} defaultValue={a.ankleArch} />
        </div>
        <Picklist name="ankleStability" label="Stability" options={ASSESSMENT_OPTIONS.ankleStability} defaultValue={a.ankleStability} />
        <Notes name="ankleNotes" defaultValue={a.ankleNotes} />
      </Region>

      <Region label="2 · Knee">
        <Picklist name="kneeAlignment" label="Alignment" options={ASSESSMENT_OPTIONS.kneeAlignment} defaultValue={a.kneeAlignment} />
        <Notes name="kneeNotes" defaultValue={a.kneeNotes} />
      </Region>

      <Region label="3 · Pelvis">
        <Picklist name="pelvisTilt" label="Tilt" options={ASSESSMENT_OPTIONS.pelvisTilt} defaultValue={a.pelvisTilt} />
        <Text name="pelvisAsisPsis" label="ASIS–PSIS alignment" defaultValue={a.pelvisAsisPsis} />
        <Notes name="pelvisNotes" defaultValue={a.pelvisNotes} />
      </Region>

      <Region label="4 · Hip">
        <Picklist name="hipPosture" label="Posture" options={ASSESSMENT_OPTIONS.hipPosture} defaultValue={a.hipPosture} />
        <Text name="hipRotation" label="Rotation asymmetry" defaultValue={a.hipRotation} />
        <Notes name="hipNotes" defaultValue={a.hipNotes} />
      </Region>

      <Region label="5 · Spine">
        <MultiPicklist label="Posture (multi)" options={ASSESSMENT_OPTIONS.spinePosture} value={spinePosture} onToggle={(v) => toggleMulti(spinePosture, setSpinePosture, v)} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={ribFlare} onChange={(e) => setRibFlare(e.target.checked)} />
          <span>Rib flare present</span>
        </label>
        <Notes name="spineNotes" defaultValue={a.spineNotes} />
      </Region>

      <Region label="6 · Scapula">
        <MultiPicklist label="Position (multi)" options={ASSESSMENT_OPTIONS.scapulaPosition} value={scapulaPosition} onToggle={(v) => toggleMulti(scapulaPosition, setScapulaPosition, v)} />
        <Text name="scapulaSymmetryLR" label="Symmetry L vs R" defaultValue={a.scapulaSymmetryLR} />
        <Notes name="scapulaNotes" defaultValue={a.scapulaNotes} />
      </Region>

      <Region label="7 · Shoulders">
        <Picklist name="shouldersRotation" label="Rotation" options={ASSESSMENT_OPTIONS.shouldersRotation} defaultValue={a.shouldersRotation} />
        <Text name="shouldersHeightSymmetry" label="Height symmetry" defaultValue={a.shouldersHeightSymmetry} />
        <Notes name="shouldersNotes" defaultValue={a.shouldersNotes} />
      </Region>

      <Region label="8 · Head / Neck">
        <MultiPicklist label="Position (multi)" options={ASSESSMENT_OPTIONS.headNeckPosition} value={headNeckPosition} onToggle={(v) => toggleMulti(headNeckPosition, setHeadNeckPosition, v)} />
        <Notes name="headNeckNotes" defaultValue={a.headNeckNotes} />
      </Region>

      <div className="adm-card">
        <h2 className="adm-card-title">Summary</h2>
        <div className="adm-form">
          <div className="adm-field">
            <label className="adm-label">Key findings & implications</label>
            <textarea name="keyFindings" defaultValue={a.keyFindings || ''} className="adm-textarea" rows={3} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Priority correction focus area</label>
            <textarea name="priorityFocus" defaultValue={a.priorityFocus || ''} className="adm-textarea" rows={2} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Exercises advised</label>
            <textarea name="exercisesAdvised" defaultValue={a.exercisesAdvised || ''} className="adm-textarea" rows={4} placeholder="Free-text for now — Vinod + Naeem to structure the menu later" />
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Sign-off</h2>
        <div className="adm-field">
          <label className="adm-label">Coach signature (typed name — sets timestamp)</label>
          <input name="coachSignedName" defaultValue={a.coachSignedName || ''} className="adm-input" />
          {a.coachSignedAt && <span className="adm-help">Signed on {new Date(a.coachSignedAt).toLocaleString('en-IN')}</span>}
        </div>
      </div>

      <div className="adm-form-actions">
        {mode === 'edit' && (
          <>
            <button type="button" onClick={handleDelete} disabled={isPending} className="adm-btn adm-btn-danger">Delete</button>
            <div className="adm-spacer" />
          </>
        )}
        <Link href={`/admin/members/${member.id}`} className="adm-btn adm-btn-secondary">Cancel</Link>
        <button type="submit" disabled={isPending} className="adm-btn">{isPending ? 'Saving…' : (mode === 'create' ? 'Create assessment' : 'Save changes')}</button>
      </div>
    </form>
  );
}

function Region({ label, children }) {
  return (
    <div className="adm-card">
      <h2 className="adm-card-title">{label}</h2>
      <div className="adm-form">{children}</div>
    </div>
  );
}

function Picklist({ name, label, options, defaultValue }) {
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      <select name={name} defaultValue={defaultValue || ''} className="adm-select">
        <option value="">— pick —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function MultiPicklist({ label, options, value, onToggle }) {
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      <div className="prv-chips">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onToggle(o)} className={`prv-chip ${value.includes(o) ? 'prv-chip-on' : ''}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Text({ name, label, defaultValue }) {
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      <input name={name} defaultValue={defaultValue || ''} className="adm-input" />
    </div>
  );
}

function Numeric({ name, label, defaultValue }) {
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      <input type="number" step="0.1" name={name} defaultValue={defaultValue ?? ''} className="adm-input" />
    </div>
  );
}

function Notes({ name, defaultValue }) {
  return (
    <div className="adm-field">
      <label className="adm-label">Observations</label>
      <textarea name={name} defaultValue={defaultValue || ''} className="adm-textarea" rows={2} />
    </div>
  );
}
