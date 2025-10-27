// src/components/booking/AppointmentsManagerModal.tsx
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
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import useCustomerStore from '@/store/useCustomerStore';
import type { Client } from '@/utils/types';

/* ==== Utils tiempo (sin alterar TZ) ==== */
function labelFromTimestamp(ts: unknown): string {
  if (!ts) return '';
  if (typeof ts === 'string') {
    const s = ts.replace(' ', 'T');
    const m = s.match(/(?:T| )(\d{2}:\d{2})(?::\d{2})?/);
    if (m) return m[1];
    const m2 = s.match(/\b([01]\d|2[0-3]):([0-5]\d)\b/);
    return m2 ? `${m2[1]}:${m2[2]}` : '';
  }
  if (ts instanceof Date) {
    const iso = ts.toISOString();
    const m = iso.match(/T(\d{2}:\d{2})(?::\d{2})?/);
    return m ? m[1] : '';
  }
  if (typeof ts === 'number') {
    const iso = new Date(ts).toISOString();
    const m = iso.match(/T(\d{2}:\d{2})(?::\d{2})?/);
    return m ? m[1] : '';
  }
  return '';
}
function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function hhmmToMinutes(hhmm: string) {
  const m = hhmm.match(/(\d{2}):(\d{2})/);
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}
function nowMinutesLocal() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function isFutureSlot(ymd: string, slotStart: string) {
  const today = todayYMD();
  if (ymd > today) return true;
  if (ymd < today) return false;
  const startHM = hhmmToMinutes(labelFromTimestamp(slotStart));
  return startHM > nowMinutesLocal();
}
function prettyYMD(ymd?: string) {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y!, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString();
}

/* ==== Helpers de ID ==== */
const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s || '');
const isNumeric = (v: unknown) => typeof v === 'number' || (/^\d+$/).test(String(v ?? ''));

/* ==== Tipos ==== */
type AppointmentItem = {
  id: number;
  client_id: number;
  dealership_id: number;
  service_name: string | null;
  vehicle_id: number | null;
  customer_id: string | null;
  slot_start: string;
  slot_end: string;
  status: 'pending' | 'confirmed' | 'canceled';
  channel: string | null;
  notes: string | null;
  // opcionales según vista:
  dealership_address?: string | null;
  brand_name?: string | null;
  model_name?: string | null;
  year?: number | null;
};

interface AppointmentsManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | undefined;
  cancelRpcName?: string; // default: fn_appointments_cancel_public
}

/* ===================================================================================== */
export default function AppointmentsManagerModal({
  open,
  onOpenChange,
  client,
  cancelRpcName = 'fn_appointments_cancel_public',
}: AppointmentsManagerModalProps) {
  const { customer } = useCustomerStore();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AppointmentItem[]>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const pendingFocusRef = useRef<HTMLTextAreaElement | null>(null);

  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago',
    []
  );

  /* ----- Detecta posibles IDs de customer (uuid o numérico) ----- */
  const getCustomerIdCandidates = () => {
    const raw =
      (customer as any)?.id ??
      (customer as any)?.uuid ??
      (customer as any)?.customer_id ??
      (customer as any)?.public_id;

    let cidUUID: string | null = null;
    let cidBigint: string | null = null; // usar string para evitar cast issues en PostgREST

    if (isUUID(String(raw))) cidUUID = String(raw);
    else if (isNumeric(raw)) cidBigint = String(raw);

    return { cidUUID, cidBigint };
  };

  /* ----- Fetch robusto con sets de columnas tolerantes ----- */
  const fetchAppointments = async () => {
    if (!client?.id || !customer) {
      setRows([]);
      return;
    }
    const { cidUUID, cidBigint } = getCustomerIdCandidates();
    setLoading(true);

    // Intentamos estos sets en orden (de mayor info a mínimo viable)
    const columnSets = [
      // set completo (puede fallar si la vista no tiene brand/model/year)
      'id, client_id, dealership_id, service_name, vehicle_id, customer_id, slot_start, slot_end, status, channel, notes, dealership_address, brand_name, model_name, year',
      // set con address pero sin marca/modelo/año
      'id, client_id, dealership_id, service_name, vehicle_id, customer_id, slot_start, slot_end, status, channel, notes, dealership_address',
      // set mínimo
      'id, client_id, dealership_id, service_name, vehicle_id, customer_id, slot_start, slot_end, status, channel, notes',
    ];

    try {
      let data: any[] | null = null;
      let lastError: any = null;

      for (const cols of columnSets) {
        try {
          let q = supabase
            .from('appointments_public')
            .select(cols)
            .eq('client_id', client.id)
            .in('status', ['pending', 'confirmed'])
            .order('slot_start', { ascending: true });

          // Filtro por customer_id híbrido:
          if (cidUUID && cidBigint) {
            // or=customer_id.eq.<uuid>,customer_id.eq.<num>
            q = q.or(`customer_id.eq.${cidUUID},customer_id.eq.${cidBigint}`);
          } else if (cidUUID) {
            q = q.eq('customer_id', cidUUID);
          } else if (cidBigint) {
            q = q.eq('customer_id', cidBigint);
          } else {
            // sin ID, no hay citas
            data = [];
            break;
          }

          const res = await q;
          if (res.error) {
            // Si es error de columna inexistente o similar, probamos siguiente set
            const msg = (res.error.message || '').toLowerCase();
            if (
              msg.includes('does not exist') ||
              msg.includes('column') ||
              msg.includes('brand_name') ||
              msg.includes('model_name') ||
              msg.includes('year') ||
              msg.includes('dealership_address')
            ) {
              lastError = res.error;
              continue;
            }
            // otro tipo de error -> abortamos
            throw res.error;
          }
          data = (res.data || []).filter(Boolean) as any[];
          break; // éxito con este set
        } catch (e) {
          lastError = e;
          continue; // probamos siguiente set
        }
      }

      if (!data) {
        // si ningún set funcionó, mostramos último error
        if (lastError) {
          console.error('appointments_public list error:', lastError);
          toast.error(lastError.message || 'No se pudo obtener las citas');
        }
        setRows([]);
        return;
      }

      setRows(data as AppointmentItem[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client?.id, (customer as any)?.id, (customer as any)?.uuid]);

  const openConfirm = (appt: AppointmentItem) => {
    const ymd = String(appt.slot_start).slice(0, 10);
    const can = appt.status !== 'canceled' && isFutureSlot(ymd, appt.slot_start);
    if (!can) {
      toast.info('No es posible cancelar una cita pasada.');
      return;
    }
    setCancelId(appt.id);
    setCancelReason('');
    setConfirmOpen(true);
    setTimeout(() => pendingFocusRef.current?.focus(), 50);
  };

  const doCancel = async () => {
    if (!cancelId || !client?.id) return;

    setCancelling(true);
    try {
      const { error } = await supabase.rpc(cancelRpcName as any, {
        p_appointment_id: cancelId,
        p_reason: cancelReason.trim() || null,
      } as any);
      if (error) {
        console.error('Cancel RPC error:', error);
        throw error;
      }

      toast.success('Cita cancelada');
      setConfirmOpen(false);
      setCancelId(null);
      setCancelReason('');
      fetchAppointments();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo cancelar la cita');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      {/* LISTADO */}
      <Modal
        isOpen={open}
        onOpenChange={onOpenChange}
        size="lg"
        backdrop="blur"
        className="sm:max-h-[88vh] sm:my-6"
        classNames={{
          base: 'm-0 sm:m-4',
          wrapper: 'items-end sm:items-center',
          header: 'px-4 sm:px-6 py-3 sm:py-4',
          body: 'px-4 sm:px-6 py-3 sm:py-4',
          footer: 'px-4 sm:px-6 py-3 sm:py-4',
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex items-start gap-2">
                <div className="inline-flex items-center gap-2 text-base sm:text-lg font-semibold">
                  <Icon icon="mdi:calendar-account" className="text-[18px]" />
                  Mis citas
                </div>
                <span className="ml-auto text-[11px] sm:text-xs text-gray-500">{tz}</span>
              </ModalHeader>

              <ModalBody className="space-y-4 sm:space-y-6 overflow-y-auto max-h-[75vh] sm:max-h-[60vh]">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Spinner />
                  </div>
                ) : rows.length === 0 ? (
                  <div className="text-sm text-gray-500">No tienes citas próximas.</div>
                ) : (
                  <div className="space-y-3">
                    {rows.map((r) => {
                      const ymd = String(r.slot_start).slice(0, 10);
                      const can = r.status !== 'canceled' && isFutureSlot(ymd, r.slot_start);

                      const carText = [r.brand_name, r.model_name, r.year]
                        .filter((x) => x != null && String(x).trim() !== '')
                        .join(' ');

                      return (
                        <div
                          key={r.id}
                          className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex flex-col gap-2"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Chip
                              variant="flat"
                              className="gap-1.5 inline-flex items-center"
                              startContent={<Icon icon="mdi:calendar-clock" className="text-[18px]" />}
                            >
                              {prettyYMD(ymd)} · {labelFromTimestamp(r.slot_start)}–
                              {labelFromTimestamp(r.slot_end)}
                            </Chip>

                            <Chip
                              variant="flat"
                              className="gap-1.5 inline-flex items-center"
                              startContent={<Icon icon="mdi:store-marker-outline" className="text-[18px]" />}
                            >
                              {r.dealership_address || `Sucursal #${r.dealership_id}`}
                            </Chip>

                            {carText && (
                              <Chip
                                variant="flat"
                                className="gap-1.5 inline-flex items-center"
                                startContent={<Icon icon="mdi:car-outline" className="text-[18px]" />}
                              >
                                {carText}
                              </Chip>
                            )}

                            <Chip
                              variant="flat"
                              className="gap-1.5 inline-flex items-center"
                              startContent={<Icon icon="mdi:progress-check" className="text-[18px]" />}
                            >
                              {r.status}
                            </Chip>
                          </div>

                          {r.notes && (
                            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              <span className="inline-flex items-center gap-1.5 font-medium">
                                <Icon icon="mdi:note-text-outline" className="text-[16px]" />
                                Nota:
                              </span>{' '}
                              {r.notes}
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="light"
                              startContent={<Icon icon="mdi:information-outline" className="text-[18px]" />}
                              onPress={() => {
                                toast.info('Para reprogramar, cancela y vuelve a agendar.');
                              }}
                            >
                              Ayuda
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              startContent={<Icon icon="mdi:calendar-remove" className="text-[18px]" />}
                              isDisabled={!can}
                              onPress={() => openConfirm(r)}
                            >
                              Cancelar cita
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ModalBody>

              <ModalFooter>
                <Button variant="light" onPress={() => onOpenChange(false)}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Confirmación */}
      <Modal
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        size="md"
        backdrop="opaque"
        classNames={{ wrapper: 'items-center' }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <Icon icon="mdi:alert-decagram-outline" className="text-[20px] text-rose-600" />
                Confirmar cancelación
              </ModalHeader>
              <ModalBody className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  ¿Deseas cancelar esta cita? Puedes indicar un motivo (opcional).
                </p>
                <textarea
                  ref={pendingFocusRef}
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value.slice(0, 300))}
                  placeholder="Ej: No podré asistir, necesito reprogramar, etc."
                  className="w-full rounded-md border border-rose-200 dark:border-rose-800/60 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={() => setConfirmOpen(false)}>
                  Volver
                </Button>
                <Button
                  color="danger"
                  className="text-white"
                  startContent={<Icon icon="mdi:calendar-remove" className="text-[18px]" />}
                  isLoading={cancelling}
                  onPress={doCancel}
                >
                  Cancelar cita
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
