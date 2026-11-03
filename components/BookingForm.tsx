'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { shopDate, formatSlot, SHOP_TIMEZONE } from '../lib/shop';
import type { Barber, Service } from '../lib/types';

type SlotsStatus = 'loading' | 'ready' | 'error';
type SubmitStatus = 'idle' | 'submitting' | 'done' | 'taken' | 'error';

interface FormState {
  name: string;
  phone: string;
  barberId: string;
  serviceId: string;
  date: string;
  startsAt: string;
  referredBy: string;
}

// Booking form for one branch. Times come from /api/slots so customers
// only see starts that fit the barber's hours and the service length.
export default function BookingForm({
  locationId,
  barbers,
  services,
}: {
  locationId: string;
  barbers: Barber[];
  services: Service[];
}) {
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    barberId: barbers[0]?.id ?? '',
    serviceId: services[0]?.id ?? '',
    date: shopDate(),
    startsAt: '',
    referredBy: '',
  });
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsStatus, setSlotsStatus] = useState<SlotsStatus>('loading');
  const [refreshKey, setRefreshKey] = useState(0);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  useEffect(() => {
    if (!form.barberId || !form.serviceId || !form.date) return;

    const controller = new AbortController();
    setSlotsStatus('loading');
    setSlots([]);
    setForm((f) => ({ ...f, startsAt: '' }));

    const params = new URLSearchParams({
      locationId,
      barberId: form.barberId,
      serviceId: form.serviceId,
      date: form.date,
    });

    fetch(`/api/slots?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load times');
        return res.json() as Promise<{ slots: string[] }>;
      })
      .then((data) => {
        setSlots(data.slots);
        setSlotsStatus('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setSlotsStatus('error');
      });

    return () => controller.abort();
  }, [locationId, form.barberId, form.serviceId, form.date, refreshKey]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.startsAt) return;
    setStatus('submitting');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          name: form.name,
          phone: form.phone,
          barberId: form.barberId,
          serviceId: form.serviceId,
          startsAt: form.startsAt,
          referredBy: form.referredBy,
        }),
      });

      if (res.status === 409) {
        setStatus('taken');
        setRefreshKey((k) => k + 1);
        return;
      }
      if (!res.ok) throw new Error('Booking failed');
      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  if (!barbers.length || !services.length) {
    return <p className="empty-state">Online booking isn't set up for this branch yet. Call the shop to book.</p>;
  }

  if (status === 'done') {
    const when = new Date(form.startsAt).toLocaleString('en-PH', {
      timeZone: SHOP_TIMEZONE,
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return <p className="confirmation">You're booked for {when}. See you then.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <label>
        Name
        <input required value={form.name} onChange={(e) => update('name', e.target.value)} />
      </label>

      <label>
        Phone
        <input required type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
      </label>

      <label>
        Barber
        <select value={form.barberId} onChange={(e) => update('barberId', e.target.value)}>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </label>

      <label>
        Service
        <select value={form.serviceId} onChange={(e) => update('serviceId', e.target.value)}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name} (₱{s.price})</option>
          ))}
        </select>
      </label>

      <label>
        Date
        <input
          required
          type="date"
          min={shopDate()}
          value={form.date}
          onChange={(e) => update('date', e.target.value)}
        />
      </label>

      <fieldset className="slot-picker">
        <legend>Time</legend>
        {slotsStatus === 'loading' && <p role="status">Loading times…</p>}
        {slotsStatus === 'error' && (
          <p className="error" role="alert">Couldn't load times. Refresh the page or try another date.</p>
        )}
        {slotsStatus === 'ready' && slots.length === 0 && (
          <p className="empty-state">No times left on this day. Try another date or barber.</p>
        )}
        {slotsStatus === 'ready' && slots.length > 0 && (
          <div className="slot-grid">
            {slots.map((iso) => (
              <label key={iso} className="slot">
                <input
                  type="radio"
                  name="slot"
                  value={iso}
                  checked={form.startsAt === iso}
                  onChange={() => update('startsAt', iso)}
                />
                <span>{formatSlot(iso)}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <label>
        How did you hear about us? (optional)
        <input value={form.referredBy} onChange={(e) => update('referredBy', e.target.value)} />
      </label>

      <button type="submit" disabled={status === 'submitting' || !form.startsAt}>
        {status === 'submitting' ? 'Booking…' : 'Confirm booking'}
      </button>

      {status === 'taken' && (
        <p className="error" role="alert">Someone just booked that time. Pick another one.</p>
      )}
      {status === 'error' && <p className="error" role="alert">Something went wrong. Try again.</p>}
    </form>
  );
}
