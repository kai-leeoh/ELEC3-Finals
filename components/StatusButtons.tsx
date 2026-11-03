'use client';

import { useState, type ChangeEvent } from 'react';
import type { AppointmentStatus } from '../lib/types';

const STATUSES: AppointmentStatus[] = ['booked', 'completed', 'no_show', 'cancelled'];

// Lets an admin change an appointment's status without leaving the table.
// Renders as a native select so it's keyboard operable by default.
export default function StatusButtons({
  appointmentId,
  initialStatus,
}: {
  appointmentId: string;
  initialStatus: AppointmentStatus;
}) {
  const [status, setStatus] = useState<AppointmentStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as AppointmentStatus;
    const previous = status;
    setStatus(next);
    setSaving(true);
    setError(false);

    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('Update failed');
    } catch {
      setStatus(previous);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="status-control">
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        aria-label="Appointment status"
        className={`status-select status-${status}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </select>
      {error && <span className="status-error" role="alert">Couldn't save, try again</span>}
    </span>
  );
}
