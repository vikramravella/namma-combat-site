import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { fullName, formatDate, paiseToString, rupeesToWords, formatRupees } from '@/lib/format';
import { VENDOR, FREEZE_POLICY, RECEIPT_STATUSES, stageMeta } from '@/lib/constants';
import { ReceiptActions } from './Actions';
import { PaymentForm } from './PaymentForm';

// Set a useful page <title> so the browser's "Save as PDF" dialog suggests
// a meaningful default filename like "Invoice NCA-2627-0006 — Yuktesh Vipparthy"
// instead of the generic "Namma Combat — Admin".
export async function generateMetadata({ params }) {
  const { id } = await params;
  const r = await db.receipt.findUnique({
    where: { id },
    include: { plan: { include: { member: true } } },
  });
  if (!r) return { title: 'Receipt' };
  const safeInvoice = r.invoiceNumber.replace(/\//g, '-');
  return { title: `${fullName(r.plan.member)} ${safeInvoice}` };
}

export default async function ReceiptDetailPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const r = await db.receipt.findUnique({
    where: { id },
    include: {
      payments: { orderBy: { receivedAt: 'asc' } },
      plan: { include: { member: true } },
    },
  });
  if (!r) notFound();
  const justCreated = sp?.created === '1';

  const totalPaid = r.payments.reduce((s, p) => s + p.amountPaise, 0);
  const balance = r.totalPaise - totalPaid;
  const lastPayment = r.payments[r.payments.length - 1];
  const status = stageMeta(RECEIPT_STATUSES, r.status);
  const fyDisplay = `${r.fiscalYear.slice(0, 2)}-${r.fiscalYear.slice(2)}`;
  const totalRupeesRoughInt = Math.round(r.totalPaise / 100);

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/receipts" className="prv-back">← Receipts</Link></p>
          <h1 className="adm-page-title">Receipt {r.invoiceNumber}</h1>
          <p className="adm-page-subtitle">
            <span className={`prv-stage prv-stage-${status.tone}`}><span className="prv-stage-dot" />{status.label}</span>
            <span className="prv-divider">·</span>
            <span>Issued {formatDate(r.issueDate)}</span>
            {balance > 0 && r.status !== 'void' && (
              <>
                <span className="prv-divider">·</span>
                <span>Balance {formatRupees(balance)}{r.nextAgreedDate ? ` due ${formatDate(r.nextAgreedDate)}` : ''}</span>
              </>
            )}
            {r.revisionCount > 0 && (
              <>
                <span className="prv-divider">·</span>
                <span className="adm-muted">Revised {formatDate(r.lastRevisedAt)}</span>
              </>
            )}
          </p>
        </div>
        <ReceiptActions receipt={r} member={r.plan.member} />
      </div>

      <div className="rcpt-doc">
        <div className="rcpt-paper">
          {/* Wordmark header */}
          <div className="rcpt-wordmark">
            <img src="/logo.svg" alt="Namma Combat" className="rcpt-wordmark-logo" />
            <p className="rcpt-wordmark-address">{VENDOR.address}</p>
            <div className="rcpt-wordmark-rule" />
          </div>

          <div className="rcpt-meta-strip">
            <div className="rcpt-meta-block">
              <div className="rcpt-meta-label">Tax Invoice</div>
              <div className="rcpt-meta-num">{r.invoiceNumber}</div>
            </div>
            <dl className="rcpt-meta-defs">
              <div><dt>Issue date</dt><dd>{formatDate(r.issueDate)}</dd></div>
              <div><dt>FY</dt><dd>{fyDisplay}</dd></div>
              <div><dt>Place of supply</dt><dd>{VENDOR.placeOfSupply}</dd></div>
              <div><dt>GSTIN</dt><dd className="adm-mono">{r.vendorGstin}</dd></div>
            </dl>
          </div>

          <div className="rcpt-billto">
            <div className="rcpt-party-label">Bill to</div>
            <div className="rcpt-party-name">{r.customerNameSnapshot}</div>
            <dl className="rcpt-party-defs">
              <div><dt>Phone</dt><dd className="adm-mono">{r.customerPhoneSnapshot}</dd></div>
              {r.customerGstinSnapshot && (
                <div><dt>GSTIN</dt><dd className="adm-mono">{r.customerGstinSnapshot}</dd></div>
              )}
            </dl>
          </div>

          <div className="rcpt-plan">
            <div className="rcpt-plan-label">Plan summary</div>
            <div className="rcpt-plan-grid">
              <div><div className="rcpt-plan-key">Tier</div><div className="rcpt-plan-val">{r.plan.tier}</div></div>
              <div><div className="rcpt-plan-key">Billing cycle</div><div className="rcpt-plan-val">{r.plan.cycle}</div></div>
              <div><div className="rcpt-plan-key">Floor access</div><div className="rcpt-plan-val">{r.plan.floorAccess}</div></div>
              <div><div className="rcpt-plan-key">SAC</div><div className="rcpt-plan-val adm-mono">{r.vendorSac}</div></div>
              <div><div className="rcpt-plan-key">Start date</div><div className="rcpt-plan-val">{formatDate(r.plan.startDate)}</div></div>
              <div><div className="rcpt-plan-key">End date</div><div className="rcpt-plan-val">{formatDate(r.plan.endDate)}</div></div>
              <div><div className="rcpt-plan-key">Duration</div><div className="rcpt-plan-val">{r.plan.durationDays} days{r.plan.bonusDays > 0 ? ` (+${r.plan.bonusDays})` : ''}</div></div>
              <div><div className="rcpt-plan-key">Freeze allowance</div><div className="rcpt-plan-val">{r.plan.freezeDaysAllowed} days max</div></div>
            </div>
          </div>

          {/* Two-column finance row: payment status (left) sits in the
              empty space next to the totals (right), instead of stacking
              below and wasting page space. */}
          <div className="rcpt-finance-row">
            <div className="rcpt-finance-left">
              {r.status === 'paid' && lastPayment && (
                <div className="rcpt-paid">
                  <div className="rcpt-paid-stamp">PAID</div>
                  <div>
                    <div className="rcpt-paid-when">Received on {formatDate(lastPayment.receivedAt)}</div>
                    <div className="rcpt-paid-method">via {lastPayment.method}{lastPayment.reference && <> · Ref <span className="adm-mono">{lastPayment.reference}</span></>}</div>
                  </div>
                </div>
              )}
              {r.status === 'partial' && (
                <>
                  <div className="rcpt-partial">
                    <div className="rcpt-partial-stamp">PART · PAID</div>
                    <div className="rcpt-partial-body">
                      <div className="rcpt-partial-amounts">
                        <span className="rcpt-partial-paid-amt">₹{paiseToString(totalPaid)}</span>
                        <span className="rcpt-partial-of">of ₹{paiseToString(r.totalPaise)}</span>
                        <span className="rcpt-partial-balance-amt">· Balance <strong>₹{paiseToString(balance)}</strong></span>
                      </div>
                      {lastPayment && (
                        <div className="rcpt-partial-meta">
                          Last received {formatDate(lastPayment.receivedAt)} via {lastPayment.method}{lastPayment.reference && <> · Ref <span className="adm-mono">{lastPayment.reference}</span></>}
                        </div>
                      )}
                    </div>
                  </div>
                  {r.nextAgreedDate && (
                    <div className="rcpt-next">
                      <span className="rcpt-next-label">Next agreed</span>
                      <span className="rcpt-next-date">{formatDate(r.nextAgreedDate)}</span>
                      <span className="rcpt-next-amount">· ₹{paiseToString(balance)} due</span>
                      {r.nextAgreedNote && <p className="rcpt-next-note">{r.nextAgreedNote}</p>}
                    </div>
                  )}
                </>
              )}
              {r.status === 'issued' && (
                <div className="rcpt-unpaid">
                  <div className="rcpt-unpaid-stamp">UNPAID</div>
                  <div>
                    <div className="rcpt-unpaid-amount">₹{paiseToString(r.totalPaise)} due</div>
                  </div>
                </div>
              )}
              {r.status === 'void' && (
                <div className="rcpt-unpaid" style={{ background: '#f3f4f6', borderColor: '#9ca3af' }}>
                  <div className="rcpt-unpaid-stamp" style={{ color: '#6b7280', borderColor: '#6b7280' }}>VOID</div>
                  <div className="rcpt-unpaid-amount">This receipt has been voided.</div>
                </div>
              )}
            </div>
            <div className="rcpt-totals-wrap">
              <table className="rcpt-totals">
                <tbody>
                  <tr><td>Subtotal (taxable)</td><td className="rcpt-num">₹{paiseToString(r.grossTaxablePaise)}</td></tr>
                  {r.discountFinalPaise > 0 && (
                    <tr className="rcpt-discount-row">
                      <td>Discount<span className="rcpt-discount-note">agreed ₹{paiseToString(r.totalPaise)} of full ₹{paiseToString(r.grossTaxablePaise + Math.round(r.grossTaxablePaise * 0.05))}</span></td>
                      <td className="rcpt-num">−₹{paiseToString(r.discountPreTaxPaise)}</td>
                    </tr>
                  )}
                  {r.discountFinalPaise > 0 && (
                    <tr><td>Net taxable</td><td className="rcpt-num">₹{paiseToString(r.netTaxablePaise)}</td></tr>
                  )}
                  <tr><td>CGST <span className="rcpt-rate">@ 2.5%</span></td><td className="rcpt-num">₹{paiseToString(r.cgstPaise)}</td></tr>
                  <tr><td>SGST <span className="rcpt-rate">@ 2.5%</span></td><td className="rcpt-num">₹{paiseToString(r.sgstPaise)}</td></tr>
                  <tr className="rcpt-total-row"><td>Total</td><td className="rcpt-num">₹{paiseToString(r.totalPaise)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="rcpt-words">
            <strong>Amount in words:</strong> {rupeesToWords(totalRupeesRoughInt)}
          </p>

          <div className="rcpt-terms">
            <div className="rcpt-terms-label">Terms & Conditions</div>
            <ol className="rcpt-terms-list">
              <li><strong>Period locked</strong> to dates above; plan starts on start date regardless of first attendance.</li>
              <li><strong>Freeze:</strong> up to {r.plan.freezeDaysAllowed} days per cycle (min {FREEZE_POLICY.minDaysPerFreeze} days/freeze, {FREEZE_POLICY.advanceNoticeDays} days advance notice). Medical exception with doctor's note.</li>
              <li><strong>Non-refundable</strong> once started. Pre-start cancellations: 5% processing deduction. Non-transferable.</li>
              <li><strong>Health declaration</strong> must be on file and current; disclose any change before next session.</li>
              <li>GST under reverse charge: No. Consumer (B2C). Jurisdiction: Bangalore courts.</li>
              <li>Digitally generated — no signature required. Queries: WhatsApp <span className="adm-mono">{VENDOR.phone}</span>.</li>
            </ol>
          </div>

          <div className="rcpt-closing">
            <div className="rcpt-closing-rule" />
            <img src="/seal.svg" alt="Namma Combat seal" className="rcpt-closing-seal" />
            <p className="rcpt-closing-tagline">Skill · Strength · Sanctuary</p>
          </div>
        </div>
      </div>

      {/* Payment management — sits below the printable receipt. Hidden on
          print so the saved PDF is just the one-page receipt. */}
      <div className="rcpt-admin-only" style={{ maxWidth: 820, margin: '24px auto 0' }}>
        <div className="adm-card">
          <h2 className="adm-card-title">Payments</h2>
          <PaymentForm receipt={r} balance={balance} />

          {r.payments.length > 0 && (
            <table className="prv-table" style={{ marginTop: 16 }}>
              <thead><tr><th>Received</th><th>Method</th><th>Reference</th><th>Amount</th></tr></thead>
              <tbody>
                {r.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.receivedAt)}</td>
                    <td>{p.method}</td>
                    <td className="adm-mono">{p.reference || '—'}</td>
                    <td>{formatRupees(p.amountPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
