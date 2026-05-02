'use client';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="adm-btn adm-btn-secondary adm-btn-sm"
    >
      Sign out
    </button>
  );
}
