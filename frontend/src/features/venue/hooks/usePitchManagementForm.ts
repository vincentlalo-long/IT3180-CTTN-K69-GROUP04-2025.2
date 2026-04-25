import { zodResolver } from "@hookform/resolvers/zod";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  buildAreaDropdownOptions,
  createAreaOptionValue,
  defaultSlotPrice,
  timeSlots,
} from "../utils/pitchManagement.utils";
import { pitchManagementSchema } from "../schemas/pitchManagement.schema";
import type {
  PitchManagementFormData,
  PitchManagementTabProps,
} from "../types/pitchManagement.types";

export function usePitchManagementForm({ facilityName }: PitchManagementTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");
  const [defaultPriceInput, setDefaultPriceInput] = useState<string>(
    defaultSlotPrice.toString(),
  );
  const [applyPriceError, setApplyPriceError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const areaDropdownOptions = useMemo(
    () => buildAreaDropdownOptions(facilityName),
    [facilityName],
  );

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

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    updatePreviewFromFile(file);
  };

  const handleImageDrop = (event: DragEvent<HTMLLabelElement>) => {
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

  return {
    areaDropdownOptions,
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
    onSubmit,
    previewName,
    previewUrl,
    savedMessage,
    selectedArea,
    setDefaultPriceInput,
    setIsDragActive,
    slotPrices,
    timeSlots,
    register,
  };
}