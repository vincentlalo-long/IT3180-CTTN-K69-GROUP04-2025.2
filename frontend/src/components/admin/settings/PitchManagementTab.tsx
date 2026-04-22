import { UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "../../ui/Button";

const pitchTypeOptions = ["5vs5", "7vs7", "11vs11"] as const;

const createAreaOptionValue = "__create_new_area__";
const defaultSlotPrice = 250000;

const areaOptions = [
  { value: "zone-north", label: "Khu sân phía Bắc" },
  { value: "zone-central", label: "Khu sân trung tâm" },
  { value: "zone-south", label: "Khu sân phía Nam" },
  { value: createAreaOptionValue, label: "Tạo khu sân mới..." },
];

const formatMinutes = (minutes: number): string => {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
};

const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const startMinutes = 6 * 60 + 30;
  const endMinutes = 23 * 60;
  const slotDuration = 90;

  for (
    let currentStart = startMinutes;
    currentStart + slotDuration <= endMinutes;
    currentStart += slotDuration
  ) {
    const currentEnd = currentStart + slotDuration;
    slots.push(`${formatMinutes(currentStart)}-${formatMinutes(currentEnd)}`);
  }

  return slots;
};

const timeSlots = generateTimeSlots();

const pitchManagementSchema = z
  .object({
    selectedArea: z.string().trim().min(1, "Vui lòng chọn khu sân."),
    newAreaName: z.string().trim().optional(),
    newAreaAddress: z.string().trim().optional(),
    pitchName: z.string().trim().min(1, "Tên sân con không được để trống."),
    pitchType: z.enum(pitchTypeOptions, {
      error: "Vui lòng chọn loại sân.",
    }),
    description: z.string().trim().min(10, "Mô tả cần tối thiểu 10 ký tự."),
    imageFile: z
      .custom<File | null>((value) => value === null || value instanceof File)
      .optional(),
    slotPrices: z.array(
      z.object({
        slotLabel: z.string(),
        price: z.number().min(0, "Giá không được âm."),
      }),
    ),
  })
  .superRefine((value, context) => {
    if (value.selectedArea === createAreaOptionValue) {
      if (!value.newAreaName?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newAreaName"],
          message: "Tên khu sân mới không được để trống.",
        });
      }

      if (!value.newAreaAddress?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newAreaAddress"],
          message: "Địa chỉ chi tiết không được để trống.",
        });
      }
    }

    value.slotPrices.forEach((slot, index) => {
      if (!Number.isFinite(slot.price)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["slotPrices", index, "price"],
          message: "Giá ca phải là số hợp lệ.",
        });
      }
    });
  });

export type PitchManagementFormData = z.infer<typeof pitchManagementSchema>;

interface PitchManagementTabProps {
  facilityName?: string;
}

const cardClass =
  "rounded-xl border border-green-600 bg-[#005e2e]/80 p-6 shadow-md backdrop-blur-sm";
const labelClass = "text-sm font-medium text-green-100";
const fieldClass =
  "w-full rounded-lg border border-green-500 bg-[#29721d]/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-green-200 focus:border-transparent focus:ring-2 focus:ring-green-400";
const errorTextClass = "text-sm text-red-300";

export function PitchManagementTab({ facilityName }: PitchManagementTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");
  const [defaultPriceInput, setDefaultPriceInput] = useState<string>(
    defaultSlotPrice.toString(),
  );
  const [applyPriceError, setApplyPriceError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const areaDropdownOptions = useMemo(() => {
    if (!facilityName?.trim()) {
      return areaOptions;
    }

    const hasFacilityInOptions = areaOptions.some(
      (option) => option.label.toLowerCase() === facilityName.toLowerCase(),
    );

    if (hasFacilityInOptions) {
      return areaOptions;
    }

    return [{ value: "zone-current", label: facilityName }, ...areaOptions];
  }, [facilityName]);

  const initialSelectedArea =
    areaDropdownOptions[0]?.value ?? createAreaOptionValue;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<PitchManagementFormData>({
    resolver: zodResolver(pitchManagementSchema),
    defaultValues: {
      selectedArea: initialSelectedArea,
      newAreaName: facilityName ?? "",
      newAreaAddress: "",
      pitchName: "Sân số 1",
      pitchType: "7vs7",
      description: "",
      imageFile: null,
      slotPrices: timeSlots.map((slotLabel) => ({
        slotLabel,
        price: defaultSlotPrice,
      })),
    },
    mode: "onBlur",
  });

  useEffect(() => {
    reset((currentValues) => ({
      ...currentValues,
      selectedArea: initialSelectedArea,
      newAreaName: facilityName ?? currentValues.newAreaName,
    }));
  }, [facilityName, initialSelectedArea, reset]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const selectedArea = useWatch({
    control,
    name: "selectedArea",
  });

  const slotPrices = useWatch({
    control,
    name: "slotPrices",
  });

  const isCreatingNewArea = selectedArea === createAreaOptionValue;

  const imageFileField = register("imageFile");

  const updatePreviewFromFile = (file: File | null) => {
    if (!file) {
      setPreviewName("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setPreviewName(file.name);
  };

  const handleImageDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files[0] ?? null;
    if (!file) {
      return;
    }

    setValue("imageFile", file, {
      shouldDirty: true,
      shouldValidate: true,
    });
    updatePreviewFromFile(file);
  };

  const handleApplyDefaultPrice = () => {
    const parsedPrice = Number(defaultPriceInput);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setApplyPriceError("Giá mặc định phải là số hợp lệ và không âm.");
      return;
    }

    setApplyPriceError(null);
    timeSlots.forEach((_, index) => {
      setValue(`slotPrices.${index}.price`, parsedPrice, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  const onSubmit = handleSubmit(async () => {
    setIsSaving(true);
    setSavedMessage(null);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 900);
    });

    setIsSaving(false);
    setSavedMessage("Đã lưu thông tin sân thành công.");
  });

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
              {...register("selectedArea")}
              className={fieldClass}
            >
              {areaDropdownOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
        </section>

        <section className={`${cardClass} space-y-6`}>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-white">
              2. Cấu hình Sân Con và Media
            </h4>
            <p className="text-sm text-green-200">
              Khai báo thông tin sân con và hình ảnh hiển thị cho trang đặt sân.
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
                <p className={errorTextClass}>{errors.pitchName.message}</p>
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
                <p className={errorTextClass}>{errors.pitchType.message}</p>
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
                  {...imageFileField}
                  onChange={(event) => {
                    imageFileField.onChange(event);
                    const file = event.target.files?.[0] ?? null;
                    updatePreviewFromFile(file);
                  }}
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
                    Chưa có ảnh được chọn. Vùng xem trước sẽ hiển thị sau khi
                    upload.
                  </p>
                )}
              </div>
              {previewName ? (
                <p className="text-xs text-green-100">File: {previewName}</p>
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
              <p className={errorTextClass}>{errors.description.message}</p>
            ) : null}
          </div>
        </section>

        <section className={`${cardClass} space-y-6`}>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-white">
              3. Cấu hình Giá theo Ca 90 Phút
            </h4>
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
                value={defaultPriceInput}
                onChange={(event) => setDefaultPriceInput(event.target.value)}
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

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {timeSlots.map((slot, index) => (
              <div
                key={slot}
                className="grid grid-cols-1 gap-3 rounded-lg border border-green-600 bg-[#29721d]/40 px-4 py-4 md:grid-cols-[1fr_180px] md:items-center"
              >
                <p className="text-sm font-medium text-white">Ca {slot}</p>
                <div className="flex flex-col gap-2">
                  <input
                    type="hidden"
                    {...register(`slotPrices.${index}.slotLabel`)}
                  />
                  <input
                    type="number"
                    min="0"
                    {...register(`slotPrices.${index}.price`, {
                      valueAsNumber: true,
                    })}
                    className={fieldClass}
                  />
                  {errors.slotPrices?.[index]?.price ? (
                    <p className={errorTextClass}>
                      {errors.slotPrices[index]?.price?.message}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-green-600 bg-[#29721d]/40 px-4 py-4 text-sm text-green-100">
            Tổng số ca: {slotPrices?.length ?? timeSlots.length} ca mỗi ngày.
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            loading={isSaving}
            className="h-[52px] w-full max-w-[280px] text-base"
          >
            Lưu cấu hình sân
          </Button>
          {savedMessage ? (
            <p className="text-sm font-medium text-emerald-200">
              {savedMessage}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
