import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  defaultSlotPrice,
  pitchTypeFromBackend,
  timeSlots,
} from "../utils/pitchManagement.utils";
import { pitchFormSchema } from "../schemas/pitchManagement.schema";
import type { PitchManagementFormData } from "../types/pitchManagement.types";
import type { PitchDetailResponse } from "../types/venue.types";

interface UsePitchFormOptions {
  selectedPitch: PitchDetailResponse | null;
  formMode: "CREATE" | "EDIT" | null;
}

export function usePitchManagementForm({
  selectedPitch,
  formMode,
}: UsePitchFormOptions) {
  const [defaultPriceInput, setDefaultPriceInput] = useState<string>(
    defaultSlotPrice.toString(),
  );
  const [applyPriceError, setApplyPriceError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PitchManagementFormData>({
    resolver: zodResolver(pitchFormSchema),
    defaultValues: {
      pitchName: "",
      pitchType: "7vs7",
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
        pitchName: "",
        pitchType: "7vs7",
        slotPrices: timeSlots.map((slotLabel) => ({
          slotLabel,
          weekdayPrice: defaultSlotPrice,
          weekendPrice: defaultSlotPrice,
        })),
      });
    } else if (formMode === "EDIT" && selectedPitch) {
      reset({
        pitchName: selectedPitch.name,
        pitchType: pitchTypeFromBackend(selectedPitch.pitchType),
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
    }
  }, [formMode, selectedPitch, reset]);

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
    applyPriceError,
    defaultPriceInput,
    errors,
    handleApplyDefaultPrice,
    handleSubmit,
    register,
    setDefaultPriceInput,
    timeSlots,
  };
}
