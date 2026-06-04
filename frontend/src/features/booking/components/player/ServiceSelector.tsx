import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { getVenueServices } from "@/features/venue/api/venueApi";
import type { ServiceItemResponse } from "@/features/venue/types/venue.types";
import { getApiErrorMessage } from "@/shared/utils/apiError";

export type SelectedServices = Record<number, number>;

interface ServiceSelectorProps {
  venueId: number;
  selectedServices: SelectedServices;
  onChange: (services: SelectedServices) => void;
  onServicesLoaded?: (services: ServiceItemResponse[]) => void;
}

const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

const formatCurrency = (amount: string | number | null | undefined) =>
  `${toNumber(amount).toLocaleString("vi-VN")} VND`;

export function ServiceSelector({
  venueId,
  selectedServices,
  onChange,
  onServicesLoaded,
}: ServiceSelectorProps) {
  const [services, setServices] = useState<ServiceItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchServices = async () => {
      if (!venueId) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getVenueServices(venueId);
        if (cancelled) return;
        setServices(data);
        onServicesLoaded?.(data);
      } catch (err) {
        if (cancelled) return;
        setServices([]);
        onServicesLoaded?.([]);
        setError(getApiErrorMessage(err, "Không thể tải dịch vụ."));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      cancelled = true;
    };
  }, [venueId, onServicesLoaded]);

  const updateQuantity = (serviceId: number, nextQuantity: number) => {
    const safeQuantity = Math.max(0, nextQuantity);
    const next = { ...selectedServices };
    if (safeQuantity === 0) {
      delete next[serviceId];
    } else {
      next[serviceId] = safeQuantity;
    }
    onChange(next);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 backdrop-blur-md p-6 text-center text-sm font-medium text-emerald-100/70 shadow-xl">
        Đang tải dịch vụ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-md p-6 text-center text-sm font-semibold text-amber-200/90 shadow-xl">
        {error}
      </div>
    );
  }

  if (!services.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl text-white">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Dịch vụ kèm theo
        </h2>
      </div>
      <div className="space-y-4">
        {services.map((service) => {
          const quantity = selectedServices[service.id] ?? 0;
          return (
            <div
              key={service.id}
              className="flex items-center justify-between gap-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {service.name}
                </p>
                <p className="text-xs text-emerald-300 font-medium mt-0.5">
                  {formatCurrency(service.price)} / {service.unit}
                </p>
              </div>
              <div className="flex h-9 shrink-0 items-center overflow-hidden rounded-lg border border-white/20 bg-white/5">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center text-white/70 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 transition"
                  onClick={() => updateQuantity(service.id, quantity - 1)}
                  disabled={quantity === 0}
                  aria-label={`Giảm ${service.name}`}
                >
                  <Minus size={15} />
                </button>
                <span className="flex h-9 w-10 items-center justify-center text-sm font-bold text-white bg-white/5 border-x border-white/10">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center text-white/70 hover:bg-white/10 transition"
                  onClick={() => updateQuantity(service.id, quantity + 1)}
                  aria-label={`Tăng ${service.name}`}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
