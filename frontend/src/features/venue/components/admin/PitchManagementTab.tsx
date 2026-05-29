import { UploadCloud, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useVenueContext } from "../../hooks/useVenueContext";
import { useVenueForm } from "../../hooks/useVenueForm";
import { usePitchManagementForm } from "../../hooks/usePitchManagementForm";
import { getApiErrorMessage } from "../../../../shared/utils/apiError";
import { Button } from "../../../../shared/components/Button";
import {
  fetchPitchesByVenue,
  createPitch,
  updatePitch,
  deletePitch as deletePitchApi,
  createVenue,
  updateVenue,
  getFields,
} from "../../api/venueApi";
import type { PitchDetailResponse, Facility } from "../../types/venue.types";
import {
  pitchTypeToBackend,
  pitchTypeDisplayLabel,
} from "../../utils/pitchManagement.utils";

const cardClass =
  "rounded-xl border border-green-600 bg-[#005e2e]/80 p-6 shadow-md backdrop-blur-sm";
const labelClass = "text-sm font-medium text-green-100";
const fieldClass =
  "w-full rounded-lg border border-green-500 bg-[#29721d]/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-green-200 focus:border-transparent focus:ring-2 focus:ring-green-400";
const errorTextClass = "text-sm text-red-300";

export function PitchManagementTab() {
  const { facilities, selectedVenueId, setSelectedVenueId } = useVenueContext();
  const [pitches, setPitches] = useState<PitchDetailResponse[]>([]);
  const [isLoadingPitches, setIsLoadingPitches] = useState(false);

  const [selectedPitch, setSelectedPitch] = useState<PitchDetailResponse | null>(null);
  const [pitchFormMode, setPitchFormMode] = useState<"CREATE" | "EDIT" | null>(null);

  const [venueFormMode, setVenueFormMode] = useState<"CREATE" | "EDIT" | null>(null);
  const [isSavingVenue, setIsSavingVenue] = useState(false);
  const [isSavingPitch, setIsSavingPitch] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const currentVenue = facilities.find((f) => f.id === selectedVenueId) ?? null;

  const existingVenueForForm = useMemo(() => {
    return currentVenue
      ? { name: currentVenue.name, address: currentVenue.address, imageUrl: null }
      : null;
  }, [currentVenue]);

  const venueForm = useVenueForm({
    mode: venueFormMode,
    existingVenue: existingVenueForForm,
  });

  const pitchForm = usePitchManagementForm({
    selectedPitch,
    formMode: pitchFormMode,
  });

  // ─── Fetch pitches khi chọn venue ────────────────────────────────
  const loadPitches = useCallback(async (venueId: string) => {
    const numericId = Number(venueId);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      setPitches([]);
      return;
    }
    setIsLoadingPitches(true);
    try {
      const data = await fetchPitchesByVenue(numericId);
      setPitches(data);
    } catch (error) {
      setPitches([]);
      setSubmitError(getApiErrorMessage(error, "Không thể tải danh sách sân con."));
    } finally {
      setIsLoadingPitches(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedVenueId) {
      setPitches([]);
      setPitchFormMode(null);
      setSelectedPitch(null);
      return;
    }
    loadPitches(selectedVenueId);
    setPitchFormMode(null);
    setSelectedPitch(null);
  }, [selectedVenueId, loadPitches]);

  // ─── Venue submit ────────────────────────────────────────────────
  const onVenueSubmit = venueForm.handleSubmit(async (data) => {
    try {
      setSubmitError(null);
      setIsSavingVenue(true);

      const formData = new FormData();
      const venueJson = JSON.stringify({
        name: data.venueName,
        address: data.venueAddress,
        description: data.venueDescription || "",
      });
      formData.append("venue", new Blob([venueJson], { type: "application/json" }));

      if (data.imageFile) {
        formData.append("avatar", data.imageFile);
      }

      if (venueFormMode === "CREATE") {
        await createVenue(formData);
        setSavedMessage("Tạo khu sân thành công!");
      } else if (venueFormMode === "EDIT" && currentVenue) {
        await updateVenue(Number(currentVenue.id), formData);
        setSavedMessage("Cập nhật khu sân thành công!");
      }

      setVenueFormMode(null);

      // Refresh danh sách venue — reload từ API
      try {
        const fields = await getFields();
        const formatted: Facility[] = fields.map((f) => ({
          id: String(f.id),
          apiFacilityId: String(f.id),
          name: f.name,
          address: f.address || "",
        }));
        if (formatted.length > 0 && !selectedVenueId) {
          setSelectedVenueId(formatted[0].id);
        }
      } catch {
        // Không critical nếu refresh fail
      }

      setTimeout(() => setSavedMessage(null), 3000);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSavingVenue(false);
    }
  });

  // ─── Pitch submit ───────────────────────────────────────────────
  const onPitchSubmit = pitchForm.handleSubmit(async (data) => {
    try {
      setSubmitError(null);
      setIsSavingPitch(true);

      const payload = {
        name: data.pitchName,
        pitchType: pitchTypeToBackend(data.pitchType),
        isActive: true,
        slotPrices: data.slotPrices.map((s, idx) => ({
          slotNumber: idx + 1,
          weekdayPrice: s.weekdayPrice,
          weekendPrice: s.weekendPrice,
        })),
      };

      if (pitchFormMode === "CREATE") {
        await createPitch(Number(selectedVenueId), payload);
        setSavedMessage("Thêm sân con thành công!");
      } else if (pitchFormMode === "EDIT" && selectedPitch) {
        await updatePitch(selectedPitch.id, payload);
        setSavedMessage("Cập nhật sân con thành công!");
      }

      setPitchFormMode(null);
      setSelectedPitch(null);
      loadPitches(selectedVenueId);
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSavingPitch(false);
    }
  });

  // ─── Delete pitch ───────────────────────────────────────────────
  const handleDeletePitch = async (pitchId: number) => {
    try {
      setSubmitError(null);
      await deletePitchApi(pitchId);
      setSavedMessage("Xóa sân con thành công!");
      loadPitches(selectedVenueId);
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  // ─── RENDER ─────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Quản lý Sân Bóng</h3>
        <p className="text-sm text-green-200">
          Thiết lập khu sân, cấu hình sân con và giá từng ca theo mô hình vận hành SaaS.
        </p>
      </div>

      {/* ═══════════ SECTION 1: KHU SÂN (VENUE) ═══════════ */}
      <section className={`${cardClass} space-y-6`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-white">1. Thông tin Khu Sân</h4>
            <p className="text-sm text-green-200">
              Chọn khu sân có sẵn hoặc tạo mới. Upload ảnh đại diện cho khu sân.
            </p>
          </div>
          {venueFormMode === null && (
            <button
              type="button"
              onClick={() => setVenueFormMode("CREATE")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Tạo khu sân mới
            </button>
          )}
        </div>

        {/* Venue selector */}
        {venueFormMode === null && (
          <div className="flex flex-col gap-2">
            <label htmlFor="venue-select" className={labelClass}>
              Chọn Khu Sân
            </label>
            <div className="flex items-center gap-3">
              <select
                id="venue-select"
                className={`${fieldClass} flex-1`}
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
              >
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
              {currentVenue && (
                <button
                  type="button"
                  onClick={() => setVenueFormMode("EDIT")}
                  className="text-blue-300 hover:text-blue-100 transition p-2"
                  title="Sửa thông tin khu sân"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Venue form (CREATE or EDIT) */}
        {venueFormMode !== null && (
          <form onSubmit={onVenueSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="venue-name" className={labelClass}>
                  Tên khu sân
                </label>
                <input
                  id="venue-name"
                  {...venueForm.register("venueName")}
                  className={fieldClass}
                  placeholder="Nhập tên khu sân"
                />
                {venueForm.errors.venueName ? (
                  <p className={errorTextClass}>{venueForm.errors.venueName.message}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="venue-address" className={labelClass}>
                  Địa chỉ chi tiết
                </label>
                <input
                  id="venue-address"
                  {...venueForm.register("venueAddress")}
                  className={fieldClass}
                  placeholder="Nhập địa chỉ chi tiết"
                />
                {venueForm.errors.venueAddress ? (
                  <p className={errorTextClass}>{venueForm.errors.venueAddress.message}</p>
                ) : null}
              </div>
            </div>

            {/* Upload ảnh đại diện */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className={labelClass}>Ảnh đại diện khu sân</p>
                <label
                  htmlFor="venue-avatar-file"
                  className={`flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
                    venueForm.isDragActive
                      ? "border-green-300 bg-green-800/40"
                      : "border-green-500 bg-green-900/30 hover:bg-green-800/40"
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    venueForm.setIsDragActive(true);
                  }}
                  onDragLeave={() => venueForm.setIsDragActive(false)}
                  onDrop={venueForm.handleImageDrop}
                >
                  <UploadCloud className="h-8 w-8 text-green-200" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      Kéo thả ảnh vào đây hoặc click để chọn
                    </p>
                    <p className="text-xs text-green-200">PNG, JPG, WEBP - tối đa 10MB</p>
                  </div>
                  <input
                    id="venue-avatar-file"
                    type="file"
                    accept="image/*"
                    className="hidden w-full"
                    name={venueForm.imageFileField.name}
                    ref={venueForm.imageFileField.ref}
                    onBlur={venueForm.imageFileField.onBlur}
                    onChange={venueForm.handleImageChange}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <p className={labelClass}>Image Preview</p>
                <div className="flex h-[220px] w-full items-center justify-center overflow-hidden rounded-lg border border-green-600 bg-green-900/30">
                  {venueForm.previewUrl ? (
                    <img
                      src={venueForm.previewUrl}
                      alt={venueForm.previewName || "Preview khu sân"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <p className="px-6 text-center text-sm text-green-200">
                      Chưa có ảnh được chọn. Vùng xem trước sẽ hiển thị sau khi upload.
                    </p>
                  )}
                </div>
                {venueForm.previewName ? (
                  <p className="text-xs text-green-100">File: {venueForm.previewName}</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" loading={isSavingVenue} className="h-[48px] w-full max-w-[220px]">
                <Save className="h-4 w-4 mr-2" />
                {venueFormMode === "CREATE" ? "Tạo khu sân" : "Cập nhật khu sân"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setVenueFormMode(null)}
                className="h-[48px] w-full max-w-[120px]"
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* ═══════════ SECTION 2: DANH SÁCH SÂN CON ═══════════ */}
      {selectedVenueId && venueFormMode === null && (
        <section className={`${cardClass} space-y-6`}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-white">2. Danh sách Sân con</h4>
              <p className="text-sm text-green-200">
                Quản lý các sân con thuộc khu sân đã chọn.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPitchFormMode("CREATE");
                setSelectedPitch(null);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm sân con mới
            </button>
          </div>

          {isLoadingPitches ? (
            <div className="text-sm text-green-200 py-4">Đang tải danh sách sân con...</div>
          ) : pitches.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-green-600 bg-green-900/30">
              <table className="w-full text-left text-sm text-white">
                <thead className="bg-[#005e2e]/50 text-xs uppercase text-green-100">
                  <tr>
                    <th scope="col" className="px-4 py-3">Tên sân con</th>
                    <th scope="col" className="px-4 py-3">Loại sân</th>
                    <th scope="col" className="px-4 py-3">Trạng thái</th>
                    <th scope="col" className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-600/50">
                  {pitches.map((pitch) => (
                    <tr key={pitch.id} className="hover:bg-green-800/40">
                      <td className="px-4 py-3 font-medium">{pitch.name}</td>
                      <td className="px-4 py-3">{pitchTypeDisplayLabel(pitch.pitchType)}</td>
                      <td className="px-4 py-3">
                        {pitch.isActive ? (
                          <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs text-green-300 border border-green-500/30">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-xs text-red-300 border border-red-500/30">
                            Bảo trì
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPitch(pitch);
                              setPitchFormMode("EDIT");
                            }}
                            className="text-blue-300 hover:text-blue-100 transition"
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePitch(pitch.id)}
                            className="text-red-300 hover:text-red-100 transition"
                            title="Xóa"
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
          ) : (
            <div className="text-sm text-green-200 py-4 italic">
              Khu sân này chưa có sân con nào. Vui lòng bấm Thêm sân con mới.
            </div>
          )}
        </section>
      )}

      {/* ═══════════ SECTION 3: FORM SÂN CON ═══════════ */}
      {pitchFormMode !== null && venueFormMode === null && (
        <form onSubmit={onPitchSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Thông tin sân con */}
            <section className={`${cardClass} space-y-6`}>
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-white">
                  {pitchFormMode === "CREATE" ? "Thêm Sân Con Mới" : "Cập nhật Sân Con"}
                </h4>
                <p className="text-sm text-green-200">Khai báo tên sân con và loại sân.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="pitch-name" className={labelClass}>Tên sân con</label>
                  <input
                    id="pitch-name"
                    {...pitchForm.register("pitchName")}
                    className={fieldClass}
                    placeholder="Ví dụ: Sân số 1, Sân VIP"
                  />
                  {pitchForm.errors.pitchName ? (
                    <p className={errorTextClass}>{pitchForm.errors.pitchName.message}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="pitch-type" className={labelClass}>Loại sân</label>
                  <select
                    id="pitch-type"
                    {...pitchForm.register("pitchType")}
                    className={fieldClass}
                  >
                    <option value="5vs5">5 vs 5</option>
                    <option value="7vs7">7 vs 7</option>
                    <option value="11vs11">11 vs 11</option>
                  </select>
                  {pitchForm.errors.pitchType ? (
                    <p className={errorTextClass}>{pitchForm.errors.pitchType.message}</p>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Right: Bảng giá 11 ca */}
            <section className={`${cardClass} space-y-6`}>
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-white">3. Cấu hình Giá theo Ca 90 Phút</h4>
                <p className="text-sm text-green-200">
                  Áp giá mặc định cho tất cả ca hoặc override từng ca cho giờ vàng.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div className="flex flex-col gap-2">
                  <label htmlFor="default-slot-price" className={labelClass}>
                    Giá mặc định cho tất cả các ca (VNĐ)
                  </label>
                  <input
                    id="default-slot-price"
                    type="number"
                    min="0"
                    value={pitchForm.defaultPriceInput}
                    onChange={(event) => pitchForm.setDefaultPriceInput(event.target.value)}
                    className={fieldClass}
                  />
                </div>
                <Button
                  type="button"
                  onClick={pitchForm.handleApplyDefaultPrice}
                  className="h-[52px] w-full md:w-[180px]"
                >
                  Áp dụng
                </Button>
              </div>

              {pitchForm.applyPriceError ? (
                <p className={errorTextClass}>{pitchForm.applyPriceError}</p>
              ) : null}

              <div className="overflow-hidden rounded-xl border border-green-600 bg-green-900/30">
                <table className="w-full text-left text-sm text-white">
                  <thead className="bg-[#005e2e]/50 text-xs uppercase text-green-100">
                    <tr>
                      <th scope="col" className="px-4 py-3">Ca (90p)</th>
                      <th scope="col" className="px-4 py-3">Giá ngày thường</th>
                      <th scope="col" className="px-4 py-3">Giá cuối tuần</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-600/50">
                    {pitchForm.timeSlots.map((slot, index) => (
                      <tr key={slot} className="hover:bg-green-800/40">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          Ca {slot}
                          <input
                            type="hidden"
                            {...pitchForm.register(`slotPrices.${index}.slotLabel` as const)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <input
                              type="number"
                              min="0"
                              {...pitchForm.register(
                                `slotPrices.${index}.weekdayPrice` as const,
                                { valueAsNumber: true },
                              )}
                              className={`${fieldClass} px-2 py-1.5`}
                            />
                            {pitchForm.errors.slotPrices?.[index]?.weekdayPrice ? (
                              <p className={errorTextClass}>
                                {pitchForm.errors.slotPrices[index]?.weekdayPrice?.message}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <input
                              type="number"
                              min="0"
                              {...pitchForm.register(
                                `slotPrices.${index}.weekendPrice` as const,
                                { valueAsNumber: true },
                              )}
                              className={`${fieldClass} px-2 py-1.5`}
                            />
                            {pitchForm.errors.slotPrices?.[index]?.weekendPrice ? (
                              <p className={errorTextClass}>
                                {pitchForm.errors.slotPrices[index]?.weekendPrice?.message}
                              </p>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                type="submit"
                loading={isSavingPitch}
                className="h-[52px] w-full max-w-[280px] text-base"
              >
                Lưu cấu hình sân con
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPitchFormMode(null);
                  setSelectedPitch(null);
                }}
                className="h-[52px] w-full max-w-[150px] text-base"
              >
                Hủy
              </Button>
              {savedMessage ? (
                <p className="text-sm font-medium text-emerald-200">{savedMessage}</p>
              ) : null}
            </div>

            {submitError ? (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                <p className="text-sm text-red-300">{submitError}</p>
              </div>
            ) : null}
          </div>
        </form>
      )}

      {/* Placeholder khi chưa chọn action */}
      {pitchFormMode === null && venueFormMode === null && selectedVenueId && !isLoadingPitches && (
        <div className="flex flex-col gap-4">
          {savedMessage ? (
            <p className="text-sm font-medium text-emerald-200">{savedMessage}</p>
          ) : null}
          {submitError ? (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">{submitError}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
