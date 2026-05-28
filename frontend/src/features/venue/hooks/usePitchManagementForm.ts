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
import type { PitchDetailResponse } from "../types/venue.types";

export function usePitchManagementForm({
  facilityName,
  selectedPitch,
  formMode,
}: PitchManagementTabProps & {
  selectedPitch: PitchDetailResponse | null;
  formMode: "CREATE" | "EDIT" | null;
}) {
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
      pitchName: "",
      pitchType: "7vs7",
      description: "",
      imageFile: null,
      slotPrices: timeSlots.map((slotLabel) => ({
        slotLabel,
        weekdayPrice: defaultSlotPrice,
        weekendPrice: defaultSlotPrice,
      })),
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (formMode === "CREATE") {
      reset({
        selectedArea: initialSelectedArea,
        newAreaName: facilityName ?? "",
        newAreaAddress: "",
        pitchName: "",
        pitchType: "7vs7",
        description: "",
        imageFile: null,
        slotPrices: timeSlots.map((slotLabel) => ({
          slotLabel,
          weekdayPrice: defaultSlotPrice,
          weekendPrice: defaultSlotPrice,
        })),
      });
      setPreviewUrl(null);
      setPreviewName("");
    } else if (formMode === "EDIT" && selectedPitch) {
      reset({
        selectedArea: initialSelectedArea,
        newAreaName: facilityName ?? "",
        newAreaAddress: "",
        pitchName: selectedPitch.name,
        pitchType:
          selectedPitch.pitchType === "5"
            ? "5vs5"
            : selectedPitch.pitchType === "11"
              ? "11vs11"
              : "7vs7",
        description: "Mô tả sân " + selectedPitch.name,
        imageFile: null,
        slotPrices: timeSlots.map((slotLabel, index) => {
          const matchedSlot = selectedPitch.slotPrices?.[index];
          return {
            slotLabel,
            weekdayPrice: matchedSlot
              ? Number(matchedSlot.weekdayPrice)
              : defaultSlotPrice,
            weekendPrice: matchedSlot
              ? Number(matchedSlot.weekendPrice)
              : defaultSlotPrice,
          };
        }),
      });
    } else {
      reset((currentValues) => ({
        ...currentValues,
        selectedArea: initialSelectedArea,
        newAreaName: facilityName ?? currentValues.newAreaName,
      }));
    }
  }, [facilityName, initialSelectedArea, reset, formMode, selectedPitch]);

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
    setValue("imageFile", file, {
      shouldDirty: true,
      shouldValidate: true,
    });
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
      setValue(`slotPrices.${index}.weekdayPrice`, parsedPrice, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue(`slotPrices.${index}.weekendPrice`, parsedPrice, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

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
    handleSubmit,
    setIsSaving,
    setSavedMessage,
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
