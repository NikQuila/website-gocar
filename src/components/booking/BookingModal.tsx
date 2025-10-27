// src/components/booking/BookingModal.tsx
'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Spinner,
  Tooltip,
  Select,
  SelectItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import useCustomerStore from '@/store/useCustomerStore';
import type { Client, Vehicle } from '@/utils/types';
import AppointmentsManagerModal from './AppointmentsManagerModal';
import { AnimatePresence, motion } from 'framer-motion';

/* ========================= helpers de color único ========================= */
function hexToRgb(hex?: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  const s = hex.replace('#', '').trim();
  const m = s.match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1].toLowerCase();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
const rgb  = (c: { r: number; g: number; b: number } | null) => c ? `rgb(${c.r},${c.g},${c.b})` : 'rgb(79,70,229)';
const rgba = (c: { r: number; g: number; b: number } | null, a=1) => c ? `rgba(${c.r},${c.g},${c.b},${a})` : `rgba(79,70,229,${a})`;

/* ========================= utils ========================= */
const labelFromTimestamp = (ts: unknown): string => {
  if (!ts) return '';
  if (typeof ts === 'string') {
    const s = ts.replace(' ', 'T');
    const m = s.match(/(?:T| )(\d{2}:\d{2})(?::\d{2})?/);
    if (m) return m[1];
    const m2 = s.match(/\b([01]\d|2[0-3]):([0-5]\d)\b/);
    return m2 ? `${m2[1]}:${m2[2]}` : '';
  }
  if (ts instanceof Date) {
    const m = ts.toISOString().match(/T(\d{2}:\d{2})(?::\d{2})?/);
    return m ? m[1] : '';
  }
  if (typeof ts === 'number') {
    const m = new Date(ts).toISOString().match(/T(\d{2}:\d{2})(?::\d{2})?/);
    return m ? m[1] : '';
  }
  return '';
};
const minuteKey = (ts: unknown): string => {
  const s =
    typeof ts === 'string' ? ts.replace(' ', 'T')
    : ts instanceof Date      ? ts.toISOString()
    : String(ts || '');
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  return m ? `${m[1]}T${m[2]}` : '';
};
const todayYMD = () => {
  const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const prettyYMD = (ymd?: string) => {
  if (!ymd) return '';
  const [y,m,d] = ymd.split('-').map(Number);
  return new Date(y!, (m??1)-1, d??1).toLocaleDateString();
};
const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const addDays = (d: Date, n: number) => { const c = new Date(d); c.setDate(c.getDate()+n); return c; };
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth   = (d: Date) => new Date(d.getFullYear(), d.getMonth()+1, 0);
const hhmmToMinutes = (hhmm: string) => { const m=hhmm.match(/(\d{2}):(\d{2})/); return m ? (+m[1])*60 + (+m[2]) : 0; };
const nowMinutesLocal = () => { const d = new Date(); return d.getHours()*60 + d.getMinutes(); };
const isFutureSlotSameDay = (ymd: string, slotStart: string) => {
  const t = todayYMD(); if (ymd > t) return true; if (ymd < t) return false;
  return hhmmToMinutes(labelFromTimestamp(slotStart)) > nowMinutesLocal();
};

/* ========================= validadores ========================= */
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const isNonEmpty = (s: string) => s.trim().length > 1;
const cleanPhone = (p: string) => p.replace(/\D/g, '');
const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s || '');
const isNumeric = (v: unknown) => typeof v === 'number' || /^\d+$/.test(String(v ?? ''));

/* ========================= tipos ========================= */
type DealershipItem = { id: number; address: string };
type Slot = { slot_start: string; slot_end: string; capacity: number };

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | undefined;
  vehicle: Vehicle;
}

/* ========================= disponibilidad mensual ========================= */
function useMonthAvailability({
  clientId, dealershipId, monthDate, tz,
}: { clientId?: number; dealershipId?: number | null; monthDate: Date; tz: string; }) {
  const cacheRef = useRef<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    if (!clientId || !dealershipId) { setAvailableDays({}); return; }
    setLoading(true);
    const start = startOfMonth(monthDate);
    const end   = endOfMonth(monthDate);

    const days: string[] = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) days.push(toYMD(d));

    const result: Record<string, boolean> = {};
    const pending: string[] = [];

    for (const ymd of days) {
      const key = `${clientId}:${dealershipId}:${ymd}`;
      if (cacheRef.current[key] !== undefined) result[ymd] = cacheRef.current[key];
      else pending.push(ymd);
    }

    const CONCURRENCY = 5;
    let idx = 0;
    async function worker() {
      while (idx < pending.length) {
        const ymd = pending[idx++];
        const { data, error } = await supabase.rpc('fn_compute_availability', {
          p_client_id: clientId, p_dealership_id: dealershipId, p_date: ymd, p_timezone: tz,
        });
        const has = !error && !!(data && (data as any[]).some((s) => isFutureSlotSameDay(ymd, s.slot_start)));
        result[ymd] = has;
        cacheRef.current[`${clientId}:${dealershipId}:${ymd}`] = has;
      }
    }
    const workers = Array.from({ length: Math.min(CONCURRENCY, pending.length) }, () => worker());
    await Promise.all(workers);

    setAvailableDays(result);
    setLoading(false);
  }, [clientId, dealershipId, monthDate, tz]);

  useEffect(() => { load(); }, [load]);

  return { loading, availableDays };
}

/* ========================= Stepper timeline (2 filas, sin overlays) =========================
   - Fila 1: espacio para la ETIQUETA del paso ACTIVO (con altura real → no tapa nada).
   - Fila 2: línea + progreso + nodos fijos (repeat(N,1fr)) → los centros no se mueven.
   - Animaciones suaves (spring). El número SIEMPRE se ve.
*/

function TimelineStepper({
  steps,
  current,
  brandRGB,
}: {
  steps: string[];
  current: number; // 1-based
  brandRGB: { r: number; g: number; b: number } | null;
}) {
  const total = Math.max(1, steps.length);
  const node = 28; // diámetro px
  const den = Math.max(1, total - 1);
  const pct = Math.max(0, Math.min(1, (current - 1) / den));
  const spring = { type: 'spring', stiffness: 320, damping: 30, mass: 0.6 };

  return (
    <div
      className="w-full relative select-none"
      // padding lateral para que la barra llegue al centro de los nodos
      style={{ paddingLeft: node / 2, paddingRight: node / 2 }}
    >
      {/* GRID de 2 filas: [etiqueta activa] / [nodos + barra] */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`,
          gridTemplateRows: 'auto 32px', // alto reservado para etiqueta arriba + fila de nodos
          rowGap: 6,
          position: 'relative',
        }}
      >
        {/* ====== FILA 1: etiqueta SOLO del paso ACTIVO (sin absolute) ====== */}
        {steps.map((label, i) => {
          const n = i + 1;
          const active = n === current;
          return (
            <div key={`label-cell-${n}`} className="min-w-0">
              <AnimatePresence mode="wait">
                {active && (
                  <motion.div
                    key={`label-${n}`}
                    className="mx-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] border bg-white max-w-[72vw] sm:max-w-[360px] break-words"
                    style={{ borderColor: rgba(brandRGB, 0.25), color: rgba(brandRGB, 0.98) }}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ type: 'tween', ease: 'easeOut', duration: 0.18 }}
                    title={label}
                  >
                    <Icon icon="mdi:progress-check" className="text-[16px]" />
                    <span className="leading-tight">{label}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* ====== FILA 2: barra base + progreso (debajo de los nodos) ====== */}
        {/* línea base (spanning all columns) */}
        <div
          className="col-span-full absolute"
          style={{
            // centramos vertical en la fila de nodos (segunda fila del grid)
            top: 'calc(100% - 32px / 2 - 1.5px)', // altura total - mitad de 32px - mitad de 3px
            left: 0,
            right: 0,
            height: 3,
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.12)',
            zIndex: 0,
          }}
        />
        {/* progreso */}
        <motion.div
          className="col-span-full absolute origin-left"
          style={{
            top: 'calc(100% - 32px / 2 - 1.5px)',
            left: 0,
            right: 0,
            height: 3,
            borderRadius: 4,
            backgroundColor: rgb(brandRGB),
            transform: 'scaleX(0)',
            zIndex: 0,
          }}
          animate={{ transform: `scaleX(${pct})` }}
          transition={spring}
        />

        {/* ====== FILA 2: nodos (fijos) ====== */}
        {steps.map((_, i) => {
          const n = i + 1;
          const past = n < current;
          const active = n === current;
          const circleBg = past ? rgb(brandRGB) : '#fff';
          const circleBorder = active ? rgb(brandRGB) : past ? rgb(brandRGB) : 'rgba(0,0,0,0.2)';
          const circleText = past ? '#fff' : active ? rgb(brandRGB) : 'rgba(0,0,0,0.85)';

          return (
            <div key={`node-${n}`} className="min-w-0">
              <div className="w-full h-[32px] grid place-items-center relative z-[1]">
                <motion.div
                  className="rounded-full grid place-items-center text-[12px] font-semibold border"
                  style={{ width: node, height: node }}
                  initial={false}
                  animate={{
                    scale: active ? 1.08 : 1,
                    boxShadow: active ? `0 0 0 4px ${rgba(brandRGB, 0.14)}` : '0 0 0 0px rgba(0,0,0,0)',
                    backgroundColor: circleBg,
                    borderColor: circleBorder,
                    color: circleText,
                  }}
                  transition={spring}
                  title={String(n)}
                >
                  {/* NÚMERO SIEMPRE VISIBLE */}
                  <span className="leading-none">{n}</span>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ========================= Calendario (mantiene opacidades) ========================= */
function CalendarGrid({
  value, onChange, monthDate, setMonthDate, availableDays, loading, brandRGB,
}: {
  value?: string | null; onChange: (ymd: string) => void;
  monthDate: Date; setMonthDate: (d: Date) => void;
  availableDays: Record<string, boolean>; loading: boolean;
  brandRGB: { r: number; g: number; b: number } | null;
}) {
  const monthName = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const first = startOfMonth(monthDate);
  const last  = endOfMonth(monthDate);
  const firstWeekday = (first.getDay() + 7) % 7;
  const totalDays = last.getDate();

  const prevMonth = () => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth()-1, 1));
  const nextMonth = () => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 1));

  const cells: Array<{ label: string; ymd?: string; disabled?: boolean }> = [];
  for (let i=0; i<firstWeekday; i++) cells.push({ label: '' });
  for (let d=1; d<=totalDays; d++) {
    const ymd = toYMD(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
    const enabled = availableDays[ymd] === true;
    cells.push({ label: String(d), ymd, disabled: !enabled });
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-sm sm:text-base font-semibold capitalize">{monthName}</div>
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="light" onPress={prevMonth} aria-label="Mes anterior"><Icon icon="mdi:chevron-left" /></Button>
          <Button size="sm" variant="light" onPress={nextMonth} aria-label="Mes siguiente"><Icon icon="mdi:chevron-right" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-[11px] sm:text-xs text-gray-500 mb-2">
        {['D','L','M','X','J','V','S'].map((d, i) => <div key={i} className="text-center py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((c, idx) => {
          if (!c.ymd) return <div key={`e-${idx}`} className="h-9 sm:h-10" />;
          const selected = value === c.ymd;
          const disabled = !!c.disabled;

          const style: React.CSSProperties = disabled
            ? { borderColor: 'rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.35)', backgroundColor: 'rgba(0,0,0,0.03)', cursor: 'not-allowed' }
            : selected
            ? { borderColor: rgba(brandRGB, 0.7), boxShadow: `0 0 0 2px ${rgba(brandRGB, 0.2)}`, backgroundColor: rgba(brandRGB, 0.1), fontWeight: 600 }
            : { borderColor: 'rgba(0,0,0,0.08)' };

          const inner = (
            <div className="h-9 sm:h-10 rounded-lg border text-sm grid place-items-center transition-colors" title={c.ymd} style={style}>
              {c.label}
            </div>
          );

          if (disabled) {
            return (
              <div key={`d-${c.ymd}`} aria-disabled className="relative">
                {inner}
                <Tooltip content="Sin horarios disponibles" placement="top" delay={180}><span className="absolute inset-0" /></Tooltip>
              </div>
            );
          }
          return <button key={`d-${c.ymd}`} onClick={() => onChange(c.ymd!)} aria-pressed={selected}>{inner}</button>;
        })}
      </div>

      {loading && (
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <Spinner size="sm" /> Cargando disponibilidad del mes…
        </div>
      )}
    </div>
  );
}

/* ========================= componente principal ========================= */
export default function BookingModal({ open, onOpenChange, client, vehicle }: BookingModalProps) {
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago', []);
  const { customer, initializeCustomer } = useCustomerStore();

  // color único
  const brandHex =
    (client as any)?.brand_color ||
    (client as any)?.theme_color  ||
    (client as any)?.primary_color ||
    '#6d28d9';
  const brandRGB = useMemo(() => hexToRgb(brandHex), [brandHex]);

  // estado
  const [dealerships, setDealerships] = useState<DealershipItem[]>([]);
  const [selectedDealershipId, setSelectedDealershipId] = useState<number | null>(
    vehicle?.dealership_id ? Number(vehicle.dealership_id) : null
  );
  const [step, setStep] = useState<1|2|3|4>(1);
  const [monthDate, setMonthDate] = useState<Date>(() => { const d=new Date(); d.setDate(1); return d; });
  const [selectedDate, setSelectedDate] = useState<string|null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookedByStart, setBookedByStart] = useState<Record<string, number>>({});
  const [selectedSlot, setSelectedSlot] = useState<{ slot_start: string; slot_end: string } | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<boolean>(() => !customer);
  const [firstName, setFirstName] = useState<string>(customer?.first_name || '');
  const [lastName,  setLastName]  = useState<string>(customer?.last_name  || '');
  const [email,     setEmail]     = useState<string>(customer?.email      || '');
  const [phone,     setPhone]     = useState<string>(customer?.phone      || '');
  const [userNote,  setUserNote]  = useState<string>('');
  const NOTE_MAX = 300;
  const [manageOpen, setManageOpen] = useState(false);

  const formValid = isNonEmpty(firstName) && isNonEmpty(lastName) && isEmail(email) && cleanPhone(phone).length >= 8;

  /* sucursales */
  useEffect(() => {
    const loadDealerships = async () => {
      if (!client?.id) return;
      const { data, error } = await supabase.from('dealerships').select('id,address').eq('client_id', Number(client.id));
      const list = !error ? ((data as any as DealershipItem[]) || []) : [];
      list.sort((a,b)=> (a.address||'').localeCompare(b.address||''));
      setDealerships(list);
      if (list.length === 1) { setSelectedDealershipId(list[0].id); setStep(2); }
      else if (selectedDealershipId == null) {
        const pre = vehicle?.dealership_id ? Number(vehicle.dealership_id) : null;
        setSelectedDealershipId(pre); setStep(pre ? 2 : 1);
      }
    };
    if (open) loadDealerships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id, open]);

  /* disponibilidad mensual */
  const { loading: monthLoading, availableDays } = useMonthAvailability({
    clientId: client?.id ? Number(client.id) : undefined,
    dealershipId: selectedDealershipId,
    monthDate, tz,
  });

  /* slots por fecha */
  useEffect(() => {
    const fetchSlots = async () => {
      setSelectedSlot(null); setSlots([]); setBookedByStart({});
      if (!client?.id || !selectedDealershipId || !selectedDate) return;
      setLoadingSlots(true);
      const { data, error } = await supabase.rpc('fn_compute_availability', {
        p_client_id: Number(client.id), p_dealership_id: Number(selectedDealershipId),
        p_date: selectedDate, p_timezone: tz,
      });
      setLoadingSlots(false);
      if (error) { toast.error(`Error cargando horarios: ${error.message}`); return; }
      setSlots((data || []) as Slot);

      const from = `${selectedDate}T00:00:00`;
      const to   = `${selectedDate}T23:59:59`;
      const ap = await supabase
        .from('appointments_public')
        .select('slot_start,status,dealership_id')
        .eq('dealership_id', selectedDealershipId)
        .gte('slot_start', from).lte('slot_start', to)
        .neq('status', 'canceled');
      if (!ap.error && ap.data) {
        const counts: Record<string, number> = {};
        for (const row of ap.data as any[]) {
          const key = minuteKey(row.slot_start); if (!key) continue;
          counts[key] = (counts[key] || 0) + 1;
        }
        setBookedByStart(counts);
      }
    };
    if (open) fetchSlots();
  }, [client?.id, selectedDealershipId, selectedDate, tz, open]);

  /* sync store → form */
  useEffect(() => {
    if (customer) {
      setFirstName(customer.first_name || '');
      setLastName(customer.last_name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setEditingCustomer(false);
    }
  }, [customer]);

  /* helpers */
  const getCustomerIds = () => {
    const raw = (customer as any)?.id ?? (customer as any)?.uuid ?? (customer as any)?.customer_id ?? (customer as any)?.public_id;
    let cidUUID: string | null = null; let cidBigint: number | null = null;
    if (isUUID(String(raw))) cidUUID = String(raw); else if (isNumeric(raw)) cidBigint = Number(raw);
    return { cidUUID, cidBigint };
  };

  const saveCustomer = async () => {
    if (!client?.id) return toast.error('Falta client_id');
    if (!formValid) return toast.error('Completa tus datos correctamente');
    try {
      await initializeCustomer({
        first_name: firstName.trim(), last_name: lastName.trim(),
        email: email.trim().toLowerCase(), phone: cleanPhone(phone),
        client_id: Number(client.id),
      } as any);
      toast.success('Datos guardados'); setEditingCustomer(false);
    } catch (e: any) { toast.error(e?.message || 'No se pudieron guardar tus datos'); }
  };

  const ensureCustomer = async (): Promise<boolean> => {
    if ((customer as any)?.id || (customer as any)?.uuid) return true;
    if (!formValid) { toast.info('Completa y guarda tus datos para continuar.'); setEditingCustomer(true); setStep(4); return false; }
    try {
      const saved = await initializeCustomer({
        first_name: firstName.trim(), last_name: lastName.trim(),
        email: email.trim().toLowerCase(), phone: cleanPhone(phone),
        client_id: Number(client?.id),
      } as any);
      return !!saved;
    } catch (e: any) { toast.error(e?.message || 'No se pudieron guardar tus datos'); return false; }
  };

  const confirmAppointment = async () => {
    if (!client?.id || !selectedDealershipId || !vehicle?.id || !selectedSlot || !selectedDate) return;
    const ok = await ensureCustomer(); if (!ok) return;
    const { cidUUID, cidBigint } = getCustomerIds();

    const contactName  = `${(customer?.first_name || firstName).trim()} ${(customer?.last_name || lastName).trim()}`.trim();
    const contactEmail = (customer?.email || email).trim().toLowerCase();
    const contactPhone = (customer?.phone || phone).trim();
    const finalNotes   = userNote.trim() ? userNote.trim().slice(0, NOTE_MAX) : null;

    if (cidUUID) {
      const { error } = await supabase.rpc('fn_appointments_create', {
        p_client_id: Number(client.id), p_dealership_id: Number(selectedDealershipId),
        p_service_name: 'visita showroom',
        p_slot_start: selectedSlot.slot_start, p_slot_end: selectedSlot.slot_end,
        p_vehicle_id: Number(vehicle.id),
        p_customer_id: cidUUID, p_channel: 'web', p_notes: finalNotes,
        p_contact_snapshot: { name: contactName, email: contactEmail, phone: contactPhone } as any,
        p_admin_note: null,
      } as any);
      if (!error) { toast.success('¡Cita agendada con éxito!'); onOpenChange(false); setManageOpen(true); return; }
      const msg = (error.message || '').toLowerCase();
      const typeErr = msg.includes('does not exist') || msg.includes('not found') || msg.includes('uuid');
      if (!typeErr) { toast.error(`No se pudo crear la cita: ${error.message}`); return; }
    }

    if (cidBigint != null) {
      const { error: e2 } = await supabase.rpc('fn_create_appointment', {
        p_client_id: Number(client.id), p_dealership_id: Number(selectedDealershipId),
        p_service_name: 'visita showroom',
        p_slot_start: selectedSlot.slot_start, p_slot_end: selectedSlot.slot_end,
        p_vehicle_id: Number(vehicle.id),
        p_customer_id: Number(cidBigint), p_channel: 'web', p_notes: finalNotes,
      } as any);
      if (!e2) { toast.success('¡Cita agendada con éxito!'); onOpenChange(false); setManageOpen(true); return; }
      toast.error(`No se pudo crear la cita: ${e2.message}`); return;
    }

    toast.error('No pude determinar el ID del cliente (UUID o numérico).');
  };

  /* derivados UI */
  const hasSingleBranch = dealerships.length === 1;
  const manyBranches = dealerships.length >= 7;
  const showStepBranch = !hasSingleBranch;
  const steps = showStepBranch ? ['Sucursal','Fecha','Horario','Tus datos'] : ['Fecha','Horario','Tus datos'];
  const canNextFromBranch = !!selectedDealershipId;
  const canNextFromDate   = !!selectedDate;
  const canNextFromTime   = !!selectedSlot;
  const canConfirm = !!selectedSlot && !!selectedDealershipId && !!client?.id && (!!customer || formValid);

  const visibleSlots = (slots||[])
    .filter((s)=> selectedDate && isFutureSlotSameDay(selectedDate, s.slot_start))
    .filter((s)=> {
      const key = minuteKey(s.slot_start);
      const taken = bookedByStart[key] || 0;
      const capacity = s.capacity ?? 1;
      return capacity - taken > 0;
    });

  /* render */
  return (
    <>
      <Modal
        isOpen={open}
        onOpenChange={(o) => { onOpenChange(o); if (!o) return; setStep(hasSingleBranch ? 2 : (selectedDealershipId ? 2 : 1)); }}
        size="lg"
        backdrop="opaque"
        classNames={{
          // drawer en mobile (pegado abajo)
          wrapper: 'items-end sm:items-center',
          base: 'w-full sm:w-auto m-0 sm:m-4 rounded-t-2xl sm:rounded-2xl sm:max-h-[92vh] max-h-[90svh] pb-[max(env(safe-area-inset-bottom),0px)]',
          header: 'px-4 sm:px-5 py-3 border-b',
          body: 'p-0',
          footer: 'px-4 sm:px-5 py-3 border-t',
        }}
      >
        <ModalContent>
          {() => (
            <div className="flex flex-col max-h-[90svh] sm:max-h-[92vh]">
              {/* header */}
              <ModalHeader className="!px-4 sm:!px-5">
                <div className="w-full space-y-3">
                  <div className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Icon icon="mdi:calendar-check" className="text-[18px]" />
                    Agendar visita
                  </div>

                  <TimelineStepper
                    steps={steps}
                    current={showStepBranch ? step : Math.max(1, step - 1)}
                    brandRGB={brandRGB}
                  />

                  <Tooltip content="Revisa y administra tus citas" delay={160}>
                    <Button
                      size="md"
                      className="w-full mt-3"
                      style={{
                        background: rgba(brandRGB, 0.16),
                        color: rgba(brandRGB, 0.98),
                        boxShadow: `0 6px 16px ${rgba(brandRGB, 0.25)}`,
                        borderColor: rgba(brandRGB, 0.25),
                      }}
                      startContent={<Icon icon="mdi:calendar-month-outline" className="text-[18px]" />}
                      endContent={<Icon icon="mdi:arrow-right" className="text-[18px]" />}
                      onPress={() => setManageOpen(true)}
                    >
                      Ver mis citas
                    </Button>
                  </Tooltip>
                </div>
              </ModalHeader>

              {/* body */}
              <ModalBody className="flex-1 overflow-y-auto px-4 sm:px-5 py-3">
                <div className="grid grid-cols-1 gap-4">

                  {/* sucursal */}
                  {showStepBranch && step === 1 && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 space-y-3">
                      <div className="text-sm font-medium">Selecciona sucursal</div>

                      {manyBranches ? (
                        <Select
                          aria-label="Seleccionar sucursal"
                          placeholder="Selecciona una sucursal"
                          selectedKeys={selectedDealershipId ? new Set([String(selectedDealershipId)]) : new Set([])}
                          onSelectionChange={(keys) => {
                            const first = Array.from(keys)[0] as string | undefined;
                            setSelectedDealershipId(first ? Number(first) : null);
                            setSelectedDate(null);
                            setSelectedSlot(null);
                          }}
                          disallowEmptySelection
                        >
                          {dealerships.map((d) => (
                            <SelectItem key={`dlp-${d.id}`} textValue={d.address || `Sucursal #${d.id}`}>
                              {d.address || `Sucursal #${d.id}`}
                            </SelectItem>
                          ))}
                        </Select>
                      ) : (
                        <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                          {dealerships.map((d) => {
                            const active = selectedDealershipId === d.id;
                            const label  = d.address || `Sucursal #${d.id}`;
                            return (
                              <Tooltip key={`dlp-btn-${d.id}`} content={label} delay={180}>
                                <Button
                                  variant={active ? 'flat' : 'bordered'}
                                  className="h-12"
                                  style={active ? { backgroundColor: rgba(brandRGB, 0.1), color: rgba(brandRGB, 0.95), borderColor: rgba(brandRGB, 0.3) } : undefined}
                                  onPress={() => { setSelectedDealershipId(d.id); setSelectedDate(null); setSelectedSlot(null); }}
                                  title={label}
                                >
                                  <Icon icon="mdi:store-marker-outline" className="mr-1.5 shrink-0" />
                                  <span className="truncate w-full text-left">{label}</span>
                                </Button>
                              </Tooltip>
                            );
                          })}
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Zona horaria: <b>{tz}</b>
                      </div>
                    </div>
                  )}

                  {/* fecha */}
                  {step === 2 && (
                    <div className="space-y-3">
                      <CalendarGrid
                        value={selectedDate}
                        onChange={(d) => { setSelectedDate(d); setSelectedSlot(null); }}
                        monthDate={monthDate}
                        setMonthDate={(d) => { setMonthDate(d); setSelectedDate(null); setSelectedSlot(null); }}
                        availableDays={availableDays}
                        loading={monthLoading}
                        brandRGB={brandRGB}
                      />
                      <div className="rounded-md text-xs sm:text-[13px] p-2.5 flex items-start gap-2" style={{ backgroundColor: rgba(brandRGB, 0.06), color: 'rgba(0,0,0,0.75)' }}>
                        <Icon icon="mdi:lightbulb-on-outline" className="mt-0.5 shrink-0" />
                        <div>Los días grises se muestran para conservar la vista de calendario, pero no tienen horarios.</div>
                      </div>
                    </div>
                  )}

                  {/* horario */}
                  {step === 3 && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          {selectedDate ? `Horarios para ${prettyYMD(selectedDate)}` : 'Selecciona una fecha'}
                        </label>
                        {selectedDate && (
                          <Chip variant="flat" className="gap-1.5" style={{ backgroundColor: rgba(brandRGB, 0.08), color: rgba(brandRGB, 0.95) }}>
                            {selectedDate}
                          </Chip>
                        )}
                      </div>

                      {(!selectedDate) ? (
                        <div className="text-sm text-gray-500">Primero elige una fecha.</div>
                      ) : loadingSlots ? (
                        <div className="flex items-center justify-center py-10"><Spinner /></div>
                      ) : visibleSlots.length === 0 ? (
                        <div className="text-sm text-gray-500">No hay horarios disponibles para esa fecha. Prueba con otro día.</div>
                      ) : (
                        <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
                          {visibleSlots.map((s, idx) => {
                            const isSelected = !!selectedSlot && selectedSlot.slot_start === s.slot_start && selectedSlot.slot_end === s.slot_end;
                            const style: React.CSSProperties = isSelected
                              ? { backgroundColor: rgba(brandRGB, 0.14), color: rgba(brandRGB, 0.98), borderColor: rgba(brandRGB, 0.4), boxShadow: `0 0 0 2px ${rgba(brandRGB, 0.18)} inset` }
                              : { backgroundColor: rgba(brandRGB, 0.06), color: rgba(brandRGB, 0.95), borderColor: rgba(brandRGB, 0.18) };
                            return (
                              <Button key={`${s.slot_start}-${idx}`} className="h-11 whitespace-nowrap" variant="flat" style={style}
                                onPress={() => setSelectedSlot({ slot_start: s.slot_start, slot_end: s.slot_end })}>
                                {labelFromTimestamp(s.slot_start)} – {labelFromTimestamp(s.slot_end)}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* datos & confirmación */}
                  {step === 4 && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Tus datos</h4>
                        {customer && !editingCustomer ? <Button size="sm" variant="light" onPress={() => setEditingCustomer(true)}>Editar</Button> : null}
                      </div>

                      {!customer || editingCustomer ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label="Nombre"><input type="text" value={firstName} onChange={(e)=>setFirstName(e.target.value)} className="h-10 rounded-md border border-gray-300 px-3 text-sm w-full" placeholder="Juan" autoComplete="given-name" /></Field>
                          <Field label="Apellido"><input type="text" value={lastName} onChange={(e)=>setLastName(e.target.value)} className="h-10 rounded-md border border-gray-300 px-3 text-sm w-full" placeholder="Pérez" autoComplete="family-name" /></Field>
                          <Field label="Email"><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="h-10 rounded-md border border-gray-300 px-3 text-sm w-full" placeholder="correo@dominio.com" autoComplete="email" inputMode="email" /></Field>
                          <Field label="Teléfono"><input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} className="h-10 rounded-md border border-gray-300 px-3 text-sm w-full" placeholder="+569..." autoComplete="tel" inputMode="tel" /></Field>
                          <div className="sm:col-span-2 flex justify-end">
                            <Button isDisabled={!formValid || !client?.id} onPress={saveCustomer}
                              startContent={<Icon icon="mdi:content-save" className="text-[18px]" />} style={{ backgroundColor: rgba(brandRGB, 0.95), color: '#fff' }}>
                              Guardar mis datos
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Chip variant="flat" className="gap-1.5 inline-flex items-center" startContent={<Icon icon="mdi:account" className="text-[18px]" />} style={{ backgroundColor: rgba(brandRGB, 0.06), color: 'rgba(0,0,0,0.8)' }}>
                            {customer.first_name} {customer.last_name}
                          </Chip>
                          <Chip variant="flat" className="gap-1.5 inline-flex items-center" startContent={<Icon icon="mdi:email-outline" className="text-[18px]" />} style={{ backgroundColor: rgba(brandRGB, 0.06), color: 'rgba(0,0,0,0.8)' }}>
                            {customer.email}
                          </Chip>
                          <Chip variant="flat" className="gap-1.5 inline-flex items-center" startContent={<Icon icon="mdi:phone" className="text-[18px]" />} style={{ backgroundColor: rgba(brandRGB, 0.06), color: 'rgba(0,0,0,0.8)' }}>
                            {customer.phone}
                          </Chip>
                        </div>
                      )}

                      <Field label={<span className="inline-flex items-center gap-1.5"><Icon icon="mdi:note-edit-outline" className="text-[18px]" /> Nota (opcional)</span>}>
                        <textarea rows={3} value={userNote} onChange={(e)=>setUserNote(e.target.value.slice(0, NOTE_MAX))}
                          placeholder="Ej: Voy con acompañante, prefiero ver el maletero, etc."
                          className="rounded-md border border-gray-300 px-3 py-2 text-sm resize-y w-full" />
                        <div className="text-[11px] text-gray-500 mt-1">{userNote.length}/{NOTE_MAX}</div>
                      </Field>

                      <div className="rounded-lg border p-3 sm:p-4">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Icon icon="mdi:clipboard-text-outline" className="text-[18px]" />
                          Resumen
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <SummaryRow icon="mdi:store-marker-outline">
                            {selectedDealershipId ? dealerships.find(d => d.id === selectedDealershipId)?.address || `Sucursal #${selectedDealershipId}` : '—'}
                          </SummaryRow>
                          <SummaryRow icon="mdi:calendar-month-outline">{selectedDate ? prettyYMD(selectedDate) : '—'}</SummaryRow>
                          <SummaryRow icon="mdi:clock-outline">
                            {selectedSlot ? `${labelFromTimestamp(selectedSlot.slot_start)}–${labelFromTimestamp(selectedSlot.slot_end)}` : '—'}
                          </SummaryRow>
                          <SummaryRow icon="mdi:earth">{tz}</SummaryRow>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>

              {/* footer */}
              <ModalFooter className="border-t">
                <div className="flex items-center gap-2 w-full">
                  <Button variant="light" onPress={() => onOpenChange(false)}>Cerrar</Button>

                  {((showStepBranch && step > 1) || (!showStepBranch && step > 2)) && (
                    <Button
                      variant="flat"
                      onPress={() => setStep((s) => (s > 2 ? ((s - 1) as any) : (showStepBranch ? 1 : 2)))}
                      style={{ backgroundColor: rgba(brandRGB, 0.08), color: rgba(brandRGB, 0.98) }}
                    >
                      <Icon icon="mdi:chevron-left" /> Volver
                    </Button>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    {showStepBranch && step === 1 && (
                      <Button isDisabled={!canNextFromBranch} onPress={() => setStep(2)}
                        style={{ backgroundColor: rgba(brandRGB, canNextFromBranch ? 0.95 : 0.35), color: '#fff' }}>
                        Elegir fecha <Icon icon="mdi:chevron-right" className="text-[18px]" />
                      </Button>
                    )}
                    {step === 2 && (
                      <Button isDisabled={!canNextFromDate} onPress={() => setStep(3)}
                        style={{ backgroundColor: rgba(brandRGB, canNextFromDate ? 0.95 : 0.35), color: '#fff' }}>
                        Elegir horario <Icon icon="mdi:chevron-right" className="text-[18px]" />
                      </Button>
                    )}
                    {step === 3 && (
                      <Button isDisabled={!canNextFromTime} onPress={() => setStep(4)}
                        style={{ backgroundColor: rgba(brandRGB, canNextFromTime ? 0.95 : 0.35), color: '#fff' }}>
                        Tus datos <Icon icon="mdi:chevron-right" className="text-[18px]" />
                      </Button>
                    )}
                    {step === 4 && (
                      <Button isDisabled={!canConfirm} onPress={confirmAppointment}
                        startContent={<Icon icon="mdi:calendar-check" className="text-[18px]" />}
                        style={{ backgroundColor: rgba(brandRGB, canConfirm ? 0.95 : 0.35), color: '#fff' }}>
                        Confirmar cita
                      </Button>
                    )}
                  </div>
                </div>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>

      <AppointmentsManagerModal open={manageOpen} onOpenChange={setManageOpen} client={client} />
    </>
  );
}

/* subcomponentes */
function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium">{label}</label>
      {children}
    </div>
  );
}
function SummaryRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon icon={icon} className="text-[18px]" />
      <span className="truncate">{children}</span>
    </div>
  );
}
