'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Debounced auto-save hook for forms.
 *
 * Returns a `save` function (call with a FormData) and a status state:
 *   { state: 'idle' | 'pending' | 'saving' | 'saved' | 'error', error?: string, lastSavedAt?: Date }
 *
 * Calls debounce 700ms — quick consecutive changes coalesce into one save.
 *
 * Usage:
 *   const { save, status } = useAutoSave(async (fd) => updateInquiry(id, fd));
 *   // on every input change:
 *   save(formDataFromForm);
 */
export function useAutoSave(action, { debounceMs = 700 } = {}) {
  const [status, setStatus] = useState({ state: 'idle' });
  const timer = useRef(null);
  const pendingFormData = useRef(null);
  const inFlight = useRef(false);

  const flush = useCallback(async () => {
    if (!pendingFormData.current || inFlight.current) return;
    const fd = pendingFormData.current;
    pendingFormData.current = null;
    inFlight.current = true;
    setStatus({ state: 'saving' });
    try {
      const r = await action(fd);
      if (r?.ok === false) {
        setStatus({ state: 'error', error: r.error || 'Save failed' });
      } else {
        setStatus({ state: 'saved', lastSavedAt: new Date() });
      }
    } catch (e) {
      setStatus({ state: 'error', error: e?.message || 'Save failed' });
    } finally {
      inFlight.current = false;
      // If a new edit came in while we were saving, save again
      if (pendingFormData.current) {
        setTimeout(flush, 50);
      }
    }
  }, [action]);

  const save = useCallback((fd) => {
    pendingFormData.current = fd;
    setStatus((s) => (s.state === 'error' ? s : { state: 'pending' }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, debounceMs);
  }, [flush, debounceMs]);

  // Save immediately on unmount if pending
  useEffect(() => {
    return () => {
      if (pendingFormData.current && !inFlight.current) flush();
    };
  }, [flush]);

  return { save, status };
}

/** Pretty status string for display */
export function autoSaveLabel(status) {
  switch (status.state) {
    case 'idle': return null;
    case 'pending': return 'Editing…';
    case 'saving': return 'Saving…';
    case 'saved': {
      const ago = status.lastSavedAt ? Math.floor((Date.now() - status.lastSavedAt) / 1000) : 0;
      return ago < 5 ? '✓ Saved' : `✓ Saved ${ago}s ago`;
    }
    case 'error': return `✗ ${status.error}`;
  }
}
