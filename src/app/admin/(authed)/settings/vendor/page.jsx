import Link from 'next/link';
import { getVendor } from '@/lib/vendor';
import { VendorForm } from './VendorForm';

export const dynamic = 'force-dynamic';

export default async function VendorSettingsPage() {
  const vendor = await getVendor();
  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/settings" className="prv-back">← Settings</Link></p>
          <h1 className="adm-page-title">Vendor / Invoice</h1>
          <p className="adm-page-subtitle">
            Brand info that appears on every receipt. Tax rates and SAC code stay code-versioned (regulatory).
          </p>
        </div>
      </div>
      <VendorForm vendor={vendor} />
    </>
  );
}
