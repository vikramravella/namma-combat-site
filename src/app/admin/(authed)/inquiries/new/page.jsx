import Link from 'next/link';
import { InquiryForm } from '../InquiryForm';
import { createInquiry } from '../actions';

export default function NewInquiryPage() {
  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/inquiries" className="prv-back">← Inquiries</Link></p>
          <h1 className="adm-page-title">New inquiry</h1>
          <p className="adm-page-subtitle">First name, last name, and phone are required. Everything else can be added later.</p>
        </div>
      </div>
      <InquiryForm action={createInquiry} mode="create" />
    </>
  );
}
