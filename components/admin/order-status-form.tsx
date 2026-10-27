"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateOrderStatus } from "@/lib/actions/admin";
import { ORDER_STATUS_LABELS } from "@/components/shared/order-status-badge";
import type { OrderStatus } from "@/lib/types";

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await updateOrderStatus({
      orderId,
      status,
      note: note.trim() || undefined,
    });
    setPending(false);
    setMessage({ ok: result.ok, text: result.message });
    if (result.ok) {
      setNote("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-ink-line bg-white p-4">
      <h2 className="text-[13.5px] font-semibold">Mettre à jour le statut</h2>
      <p className="mt-0.5 text-[10.5px] text-ink-muted">
        Un email est envoyé au client si Brevo est configuré.
      </p>
      <Select
        value={status}
        onChange={(event) => setStatus(event.target.value as OrderStatus)}
        aria-label="Nouveau statut"
        className="mt-3"
      >
        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((entry) => (
          <option key={entry} value={entry}>
            {ORDER_STATUS_LABELS[entry]}
          </option>
        ))}
      </Select>
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Note interne ou message au client (optionnel)"
        className="mt-2 min-h-[70px] text-[12px]"
        maxLength={300}
      />
      {message && (
        <p
          className={
            message.ok
              ? "mt-2 flex items-start gap-1.5 text-[11px] font-medium text-brand-success"
              : "mt-2 text-[11px] font-medium text-brand-accent"
          }
          role="status"
        >
          {message.ok && <Check className="mt-0.5 h-3 w-3 shrink-0" />}
          {message.text}
        </p>
      )}
      <Button type="submit" size="sm" disabled={pending} className="mt-3 w-full">
        {pending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mise à jour…
          </>
        ) : (
          "Enregistrer le statut"
        )}
      </Button>
    </form>
  );
}
