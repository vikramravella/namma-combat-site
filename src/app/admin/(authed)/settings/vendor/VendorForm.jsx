'use client';
import { useState, useTransition } from 'react';
import { saveVendor } from './actions';

export function VendorForm({ vendor }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved(false);
    const fd = new FormData(e.target);
    startTransition(async () => {
      const r = await saveVendor(fd);
      if (r?.ok === false) setError(r.error);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}
      {saved && <p className="adm-success">Saved. Receipt pages will pick it up on next load.</p>}

      <div className="adm-card">
        <h2 className="adm-card-title">Brand</h2>
        <div className="adm-form">
          <Field label="Legal name" name="legalName" defaultValue={vendor.legalName} required />
          <Field label="Brand name" name="brandName" defaultValue={vendor.brandName} required />
          <Field label="Brand short (acronym)" name="brandShort" defaultValue={vendor.brandShort} required />
          <Field label="Address (printed on receipt)" name="address" defaultValue={vendor.address} required />
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">GST / Tax</h2>
        <div className="adm-form">
          <div className="adm-form-row">
            <Field label="GSTIN" name="gstin" defaultValue={vendor.gstin} required mono />
            <Field label="PAN" name="pan" defaultValue={vendor.pan} required mono />
          </div>
          <div className="adm-form-row">
            <Field label="SAC code" name="sac" defaultValue={vendor.sac} required mono />
            <Field label="Place of supply" name="placeOfSupply" defaultValue={vendor.placeOfSupply} required />
          </div>
          <Field label="SAC description" name="sacDescription" defaultValue={vendor.sacDescription} required />
          <p className="adm-help">
            Tax rates (CGST 2.5% + SGST 2.5%) are intentionally not editable here — they&rsquo;re regulatory and
            need a code review to change. Edit <span className="adm-mono">src/lib/constants.js</span> if a rate changes.
          </p>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Contact</h2>
        <div className="adm-form">
          <div className="adm-form-row">
            <Field label="Phone" name="phone" defaultValue={vendor.phone} required mono />
            <Field label="WhatsApp number (no +, no spaces — for wa.me)" name="whatsappNumber" defaultValue={vendor.whatsappNumber} required mono />
          </div>
          <Field label="Email" name="email" defaultValue={vendor.email} required mono />
        </div>
      </div>

      <div className="adm-form-actions">
        <button type="submit" disabled={isPending} className="adm-btn">
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, defaultValue, required, mono }) {
  return (
    <div className="adm-field">
      <label className="adm-label">{label}{required && ' *'}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className={`adm-input ${mono ? 'adm-mono' : ''}`}
      />
    </div>
  );
}
