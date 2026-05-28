import { UploadCloud, Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useVenueContext } from "../../hooks/useVenueContext";
import { getApiErrorMessage } from "../../../../shared/utils/apiError";
import { Button } from "../../../../shared/components/Button";
import { usePitchManagementForm } from "../../hooks/usePitchManagementForm";
import type { PitchManagementTabProps } from "../../types/pitchManagement.types";
import type { PitchDetailResponse } from "../../types/venue.types";
import { createAreaOptionValue } from "../../utils/pitchManagement.utils";

const cardClass =
  "rounded-xl border border-green-600 bg-[#005e2e]/80 p-6 shadow-md backdrop-blur-sm";
const labelClass = "text-sm font-medium text-green-100";
const fieldClass =
  "w-full rounded-lg border border-green-500 bg-[#29721d]/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-green-200 focus:border-transparent focus:ring-2 focus:ring-green-400";
const errorTextClass = "text-sm text-red-300";

export function PitchManagementTab({ facilityName }: PitchManagementTabProps) {
  const { facilities, selectedVenueId, setSelectedVenueId } = useVenueContext();
  const [pitches, setPitches] = useState<PitchDetailResponse[]>([]);
  const [isLoadingPitches, setIsLoadingPitches] = useState(false);

  const [selectedPitch, setSelectedPitch] =
    useState<PitchDetailResponse | null>(null);
  const [formMode, setFormMode] = useState<"CREATE" | "EDIT" | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedVenueId || selectedVenueId === createAreaOptionValue) {
      setPitches([]);
      setFormMode(null);
      setSelectedPitch(null);
      return;
    }

    setIsLoadingPitches(true);
    const mockFetch = setTimeout(() => {
      if (selectedVenueId === "2") {
        setPitches([
          {
            id: 1,
            name: "Sân 1 - Máy Tơ",
            pitchType: "7",
            isActive: true,
            venueId: 2,
            venueName: "Cụm Bách Khoa",
            basePrice: 500000,
            slotPrices: [],
          },
          {
            id: 2,
            name: "Sân 2 - Lê Thanh Nghị",
            pitchType: "5",
            isActive: true,
            venueId: 2,
            venueName: "Cụm Bách Khoa",
            basePrice: 300000,
            slotPrices: [],
          },
        ]);
      } else {
        setPitches([]);
      }
      setIsLoadingPitches(false);
    }, 500);

    return () => clearTimeout(mockFetch);
  }, [selectedVenueId]);

  const {
    applyPriceError,
    defaultPriceInput,
    errors,
    handleApplyDefaultPrice,
    handleImageChange,
    handleImageDrop,
    imageFileField,
    isCreatingNewArea,
    isDragActive,
    isSaving,
    handleSubmit: handleFormSubmit,
    previewName,
    previewUrl,
    register,
    savedMessage,
    setSavedMessage,
    setDefaultPriceInput,
    setIsDragActive,
    timeSlots,
  } = usePitchManagementForm({ facilityName, selectedPitch, formMode });

  const onSubmit = handleFormSubmit(async (data) => {
    try {
      setSubmitError(null);

      const formData = new FormData();
      formData.append("name", data.pitchName);
      formData.append("pitchType", data.pitchType);
      // Backend expects isActive boolean/string
      formData.append("isActive", "true");

      if (data.description) {
        formData.append("description", data.description);
      }

      // Đóng gói file ảnh
      if (data.imageFile) {
        formData.append("avatar", data.imageFile);
      }

      // Đóng gói mảng giá
      formData.append("slotPrices", JSON.stringify(data.slotPrices));

      console.log("FormData payload sẵn sàng cho việc submit:", formData);
      for (const pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      // TODO: const response = await axios.post("/api/venues/pitches", formData, { headers: { "Content-Type": "multipart/form-data" } });

      // -- Bắt đầu đoạn logic Mock Update Table --
      if (formMode === "CREATE") {
        const newPitch: PitchDetailResponse = {
          id: Date.now(),
          name: data.pitchName,
          pitchType:
            data.pitchType === "11vs11"
              ? "11"
              : data.pitchType === "5vs5"
                ? "5"
                : "7",
          isActive: true,
          venueId: Number(selectedVenueId),
          venueName:
            facilities.find((f) => String(f.id) === selectedVenueId)?.name ||
            "",
          basePrice: data.slotPrices[0].weekdayPrice,
          slotPrices: data.slotPrices.map((s, idx) => ({
            slotNumber: idx + 1,
            weekdayPrice: s.weekdayPrice,
            weekendPrice: s.weekendPrice,
          })),
        };
        setPitches((prev) => [...prev, newPitch]);
        setSavedMessage("Thêm sân con thành công!");
      } else if (formMode === "EDIT" && selectedPitch) {
        setPitches((prev) =>
          prev.map((p) =>
            p.id === selectedPitch.id
              ? {
                  ...p,
                  name: data.pitchName,
                  pitchType:
                    data.pitchType === "11vs11"
                      ? "11"
                      : data.pitchType === "5vs5"
                        ? "5"
                        : "7",
                  basePrice: data.slotPrices[0].weekdayPrice,
                  slotPrices: data.slotPrices.map((s, idx) => ({
                    slotNumber: idx + 1,
                    weekdayPrice: s.weekdayPrice,
                    weekendPrice: s.weekendPrice,
                  })),
                }
              : p,
          ),
        );
        setSavedMessage("Cập nhật sân con thành công!");
      }
      // -- Kết thúc đoạn logic Mock Update Table --

      setFormMode(null);
      setSelectedPitch(null);

      // Ẩn savedMessage sau 3 giây
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  });

  const handleDeletePitch = async (pitchId: number) => {
    try {
      setSubmitError(null);
      // TODO: await axios.delete(`/api/venues/pitches/${pitchId}`);
      setPitches((prev) => prev.filter((p) => p.id !== pitchId));
      setSavedMessage("Xóa sân con thành công!");
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Thêm Sân Bóng</h3>
        <p className="text-sm text-green-200">
          Thiết lập khu sân, cấu hình sân con và giá từng ca theo mô hình vận
          hành SaaS.
        </p>
      </div>

      <form onSubmit={onSubmit} className="w-full space-y-8">
        <section className={`${cardClass} space-y-6`}>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-white">
              1. Thông tin Khu Sân
            </h4>
            <p className="text-sm text-green-200">
              Chọn khu sân có sẵn hoặc tạo mới để thiết lập thông tin cơ sở.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="selected-area" className={labelClass}>
              Chọn Khu Sân
            </label>
            <select
              id="selected-area"
              className={fieldClass}
              value={selectedVenueId}
              {...register("selectedArea")}
              onChange={(e) => {
                register("selectedArea").onChange(e);
                setSelectedVenueId(e.target.value);
              }}
            >
              {facilities.map((facility) => (
                <option key={facility.id} value={String(facility.id)}>
                  {facility.name}
                </option>
              ))}
              <option value={createAreaOptionValue}>Tạo khu sân mới...</option>
            </select>
            {errors.selectedArea ? (
              <p className={errorTextClass}>{errors.selectedArea.message}</p>
            ) : null}
          </div>

          {isCreatingNewArea ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="new-area-name" className={labelClass}>
                  Tên khu sân mới
                </label>
                <input
                  id="new-area-name"
                  {...register("newAreaName")}
                  className={fieldClass}
                  placeholder="Nhập tên khu sân mới"
                />
                {errors.newAreaName ? (
                  <p className={errorTextClass}>{errors.newAreaName.message}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="new-area-address" className={labelClass}>
                  Địa chỉ chi tiết
                </label>
                <input
                  id="new-area-address"
                  {...register("newAreaAddress")}
                  className={fieldClass}
                  placeholder="Nhập địa chỉ chi tiết của khu sân"
                />
                {errors.newAreaAddress ? (
                  <p className={errorTextClass}>
                    {errors.newAreaAddress.message}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {!isCreatingNewArea && (
            <div className="mt-8 space-y-4 pt-4 border-t border-green-600/50">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-md font-semibold text-white">
                  Danh sách Sân con đang quản lý
                </h5>
                <button
                  type="button"
                  onClick={() => {
                    setFormMode("CREATE");
                    setSelectedPitch(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Thêm sân con mới
                </button>
              </div>

              {isLoadingPitches ? (
                <div className="text-sm text-green-200 py-4">
                  Đang tải danh sách sân con...
                </div>
              ) : pitches.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-green-600 bg-green-900/30">
                  <table className="w-full text-left text-sm text-white">
                    <thead className="bg-[#005e2e]/50 text-xs uppercase text-green-100">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          Tên sân con
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Loại sân
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Trạng thái
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-600/50">
                      {pitches.map((pitch) => (
                        <tr key={pitch.id} className="hover:bg-green-800/40">
                          <td className="px-4 py-3 font-medium">
                            {pitch.name}
                          </td>
                          <td className="px-4 py-3">
                            {pitch.pitchType} vs {pitch.pitchType}
                          </td>
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
                                  setFormMode("EDIT");
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
                  Khu sân này chưa có sân con nào. Vui lòng bấm Thêm sân con
                  mới.
                </div>
              )}
            </div>
          )}
        </section>

        {!isCreatingNewArea && !formMode ? (
          <div className="rounded-xl border border-green-600 border-dashed bg-[#005e2e]/40 p-8 text-center mt-6">
            <p className="text-green-200">
              Vui lòng chọn một sân từ danh sách trên hoặc bấm{" "}
              <span className="font-semibold text-white">Thêm sân con mới</span>{" "}
              để cấu hình.
            </p>
          </div>
        ) : null}

        {(isCreatingNewArea || formMode) && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <section className={`${cardClass} space-y-6 flex flex-col`}>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-white">
                    {isCreatingNewArea
                      ? "Cấu hình Sân Con và Media"
                      : formMode === "CREATE"
                        ? "Thêm Sân Con Mới"
                        : "Cập nhật Sân Con"}
                  </h4>
                  <p className="text-sm text-green-200">
                    Khai báo thông tin sân con và hình ảnh hiển thị cho trang
                    đặt sân.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="pitch-name" className={labelClass}>
                      Tên sân con
                    </label>
                    <input
                      id="pitch-name"
                      {...register("pitchName")}
                      className={fieldClass}
                      placeholder="Ví dụ: Sân số 1, Sân VIP"
                    />
                    {errors.pitchName ? (
                      <p className={errorTextClass}>
                        {errors.pitchName.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="pitch-type" className={labelClass}>
                      Loại sân
                    </label>
                    <select
                      id="pitch-type"
                      {...register("pitchType")}
                      className={fieldClass}
                    >
                      <option value="5vs5">5 vs 5</option>
                      <option value="7vs7">7 vs 7</option>
                      <option value="11vs11">11 vs 11</option>
                    </select>
                    {errors.pitchType ? (
                      <p className={errorTextClass}>
                        {errors.pitchType.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <p className={labelClass}>Ảnh sân</p>
                    <label
                      htmlFor="pitch-image-file"
                      className={`flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
                        isDragActive
                          ? "border-green-300 bg-green-800/40"
                          : "border-green-500 bg-green-900/30 hover:bg-green-800/40"
                      }`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragActive(true);
                      }}
                      onDragLeave={() => setIsDragActive(false)}
                      onDrop={handleImageDrop}
                    >
                      <UploadCloud className="h-8 w-8 text-green-200" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">
                          Kéo thả ảnh vào đây hoặc click để chọn
                        </p>
                        <p className="text-xs text-green-200">
                          PNG, JPG, WEBP - tối đa 10MB
                        </p>
                      </div>
                      <input
                        id="pitch-image-file"
                        type="file"
                        accept="image/*"
                        className="hidden w-full"
                        name={imageFileField.name}
                        ref={imageFileField.ref}
                        onBlur={imageFileField.onBlur}
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className={labelClass}>Image Preview</p>
                    <div className="flex h-[220px] w-full items-center justify-center overflow-hidden rounded-lg border border-green-600 bg-green-900/30">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={previewName || "Preview sân bóng"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <p className="px-6 text-center text-sm text-green-200">
                          Chưa có ảnh được chọn. Vùng xem trước sẽ hiển thị sau
                          khi upload.
                        </p>
                      )}
                    </div>
                    {previewName ? (
                      <p className="text-xs text-green-100">
                        File: {previewName}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="description" className={labelClass}>
                    Mô tả sân
                  </label>
                  <textarea
                    id="description"
                    {...register("description")}
                    rows={5}
                    className={fieldClass}
                    placeholder="Mô tả tình trạng mặt sân, khu vực gửi xe, tiện ích, ánh sáng..."
                  />
                  {errors.description ? (
                    <p className={errorTextClass}>
                      {errors.description.message}
                    </p>
                  ) : null}
                </div>
              </section>

              <section className={`${cardClass} space-y-6`}>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-white">
                    3. Cấu hình Giá theo Ca 90 Phút
                  </h4>
                  <p className="text-sm text-green-200">
                    Áp giá mặc định cho tất cả ca hoặc override từng ca cho giờ
                    vàng.
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
                      value={defaultPriceInput}
                      onChange={(event) =>
                        setDefaultPriceInput(event.target.value)
                      }
                      className={fieldClass}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleApplyDefaultPrice}
                    className="h-[52px] w-full md:w-[180px]"
                  >
                    Áp dụng
                  </Button>
                </div>

                {applyPriceError ? (
                  <p className={errorTextClass}>{applyPriceError}</p>
                ) : null}

                <div className="flex flex-col gap-4 lg:col-span-1">
                  <div className="overflow-hidden rounded-xl border border-green-600 bg-green-900/30">
                    <table className="w-full text-left text-sm text-white">
                      <thead className="bg-[#005e2e]/50 text-xs uppercase text-green-100">
                        <tr>
                          <th scope="col" className="px-4 py-3">
                            Ca (90p)
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Giá ngày thường
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Giá cuối tuần
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-green-600/50">
                        {timeSlots.map((slot, index) => (
                          <tr key={slot} className="hover:bg-green-800/40">
                            <td className="px-4 py-3 font-medium whitespace-nowrap">
                              Ca {slot}
                              <input
                                type="hidden"
                                {...register(
                                  `slotPrices.${index}.slotLabel` as const,
                                )}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  {...register(
                                    `slotPrices.${index}.weekdayPrice` as const,
                                    { valueAsNumber: true },
                                  )}
                                  className={`${fieldClass} px-2 py-1.5`}
                                />
                                {errors.slotPrices?.[index]?.weekdayPrice ? (
                                  <p className={errorTextClass}>
                                    {
                                      errors.slotPrices[index]?.weekdayPrice
                                        ?.message
                                    }
                                  </p>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  {...register(
                                    `slotPrices.${index}.weekendPrice` as const,
                                    { valueAsNumber: true },
                                  )}
                                  className={`${fieldClass} px-2 py-1.5`}
                                />
                                {errors.slotPrices?.[index]?.weekendPrice ? (
                                  <p className={errorTextClass}>
                                    {
                                      errors.slotPrices[index]?.weekendPrice
                                        ?.message
                                    }
                                  </p>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="submit"
                  loading={isSaving}
                  className="h-[52px] w-full max-w-[280px] text-base"
                >
                  Lưu cấu hình sân con
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormMode(null);
                    setSelectedPitch(null);
                  }}
                  className="h-[52px] w-full max-w-[150px] text-base"
                >
                  Hủy
                </Button>
                {savedMessage ? (
                  <p className="text-sm font-medium text-emerald-200">
                    {savedMessage}
                  </p>
                ) : null}
              </div>

              {submitError ? (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                  <p className="text-sm text-red-300">{submitError}</p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </form>
    </div>
  );
}
