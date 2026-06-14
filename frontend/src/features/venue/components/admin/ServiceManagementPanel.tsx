import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";

import {
  createAdminVenueService,
  deleteAdminVenueService,
  fetchAdminVenueServices,
  updateAdminVenueService,
  type ServiceItemPayload,
} from "../../api/venueApi";
import type { ServiceItemResponse } from "../../types/venue.types";
import { formatMoney } from "@/features/booking/utils/booking.utils";
import { getApiErrorMessage } from "@/shared/utils/apiError";

interface ServiceManagementPanelProps {
  venueId: number;
}

const emptyForm: ServiceItemPayload = {
  name: "",
  description: "",
  price: 0,
  unit: "lan",
  status: "ACTIVE",
};

const cardClass =
  "rounded-xl border border-green-600 bg-[#005e2e]/80 p-6 shadow-md backdrop-blur-sm";
const fieldClass =
  "w-full rounded-lg border border-green-500 bg-[#29721d]/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-green-200 focus:border-transparent focus:ring-2 focus:ring-green-400";

export function ServiceManagementPanel({ venueId }: ServiceManagementPanelProps) {
  const [services, setServices] = useState<ServiceItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<ServiceItemResponse | null>(null);
  const [formData, setFormData] = useState<ServiceItemPayload>(emptyForm);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminVenueServices(venueId);
      setServices(data);
    } catch (loadError) {
      setServices([]);
      setError(getApiErrorMessage(loadError, "Khong the tai danh sach dich vu."));
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    loadServices();
    setEditingService(null);
    setFormData(emptyForm);
  }, [loadServices]);

  const resetForm = () => {
    setEditingService(null);
    setFormData(emptyForm);
  };

  const handleEdit = (service: ServiceItemResponse) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description ?? "",
      price: Number(service.price),
      unit: service.unit || "lan",
      status: service.status || "ACTIVE",
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        status: formData.status || "ACTIVE",
      };

      if (editingService) {
        await updateAdminVenueService(editingService.id, payload);
        setMessage("Da cap nhat dich vu.");
      } else {
        await createAdminVenueService(venueId, payload);
        setMessage("Da them dich vu.");
      }

      resetForm();
      await loadServices();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Khong the luu dich vu."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (!window.confirm("Xoa dich vu nay?")) {
      return;
    }

    setError(null);
    setMessage(null);
    try {
      await deleteAdminVenueService(serviceId);
      setMessage("Da xoa dich vu.");
      await loadServices();
      if (editingService?.id === serviceId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "Khong the xoa dich vu."));
    }
  };

  return (
    <section className={`${cardClass} space-y-6`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">3. Dịch vụ đi kèm</h4>
          <p className="text-sm text-green-200">
            Quản lý catalog dịch vụ bán kèm khi đặt sân và khi chốt hóa đơn.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1.2fr_1fr_140px_120px_auto]">
        <input
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          className={fieldClass}
          placeholder="Tên dịch vụ"
          required
        />
        <input
          value={formData.description ?? ""}
          onChange={(event) => setFormData({ ...formData, description: event.target.value })}
          className={fieldClass}
          placeholder="Mô tả"
        />
        <input
          type="number"
          min={1}
          value={formData.price}
          onChange={(event) => setFormData({ ...formData, price: Number(event.target.value) })}
          className={fieldClass}
          placeholder="Giá"
          required
        />
        <input
          value={formData.unit}
          onChange={(event) => setFormData({ ...formData, unit: event.target.value })}
          className={fieldClass}
          placeholder="Đơn vị"
          required
        />
        <div className="flex gap-2">
          <select
            value={formData.status}
            onChange={(event) => setFormData({ ...formData, status: event.target.value })}
            className={`${fieldClass} min-w-[110px]`}
          >
            <option className="text-slate-900" value="ACTIVE">Active</option>
            <option className="text-slate-900" value="INACTIVE">Inactive</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingService ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingService ? "Lưu" : "Thêm"}
          </button>
          {editingService && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/20 px-3 text-white transition hover:bg-white/10"
              title="Hủy sửa"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {message && <p className="text-sm font-medium text-emerald-200">{message}</p>}
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-green-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải dịch vụ...
        </div>
      ) : services.length === 0 ? (
        <div className="text-sm text-green-200 italic">Chưa có dịch vụ nào cho khu sân này.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-green-600 bg-green-900/30">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-[#005e2e]/50 text-xs uppercase text-green-100">
              <tr>
                <th className="px-4 py-3">Dịch vụ</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-600/50">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-green-800/40">
                  <td className="px-4 py-3">
                    <div className="font-medium">{service.name}</div>
                    {service.description && (
                      <div className="mt-1 text-xs text-green-200">{service.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {formatMoney(Number(service.price))}/{service.unit}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2.5 py-1 text-xs ${
                      service.status === "ACTIVE"
                        ? "border-green-500/30 bg-green-500/20 text-green-300"
                        : "border-slate-500/30 bg-slate-500/20 text-slate-200"
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(service)}
                        className="text-blue-300 transition hover:text-blue-100"
                        title="Sửa dịch vụ"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(service.id)}
                        className="text-red-300 transition hover:text-red-100"
                        title="Xóa dịch vụ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
