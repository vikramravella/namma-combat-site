'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Hijack every .prv-back click and route it through router.back() so the
// in-app "← Members" / "← Receipts" / "← Inquiries" breadcrumb returns
// to the actual previous page in the user's navigation history, not the
// hardcoded section listing. The fallback href on the link itself takes
// over only when there's no SPA history (direct URL landing, fresh tab).
export function BackLinkBehavior() {
  const router = useRouter();

  useEffect(() => {
    function onClick(e) {
      // Bail if a modifier key is held — staff might want to open the
      // listing in a new tab.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;
      const el = e.target.closest('.prv-back');
      if (!el) return;
      // window.history.length === 1 on a direct landing (no prior nav).
      if (window.history.length <= 1) return;
      e.preventDefault();
      router.back();
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [router]);

  return null;
}
