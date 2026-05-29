import { z } from "zod";

import { pitchTypeOptions } from "../utils/pitchManagement.utils";

// ─── Venue Form Schema ──────────────────────────────────────────────

export const venueFormSchema = z.object({
  venueName: z.string().trim().min(1, "Tên khu sân không được để trống."),
  venueAddress: z.string().trim().min(1, "Địa chỉ không được để trống."),
  venueDescription: z.string().trim().optional().default(""),
  imageFile: z
    .custom<File | null>((value) => value === null || value instanceof File)
    .optional()
    .default(null),
});

// ─── Pitch Form Schema ──────────────────────────────────────────────

export const pitchFormSchema = z
  .object({
    pitchName: z.string().trim().min(1, "Tên sân con không được để trống."),
    pitchType: z.enum(pitchTypeOptions, {
      error: "Vui lòng chọn loại sân.",
    }),
    slotPrices: z.array(
      z.object({
        slotLabel: z.string(),
        weekdayPrice: z.number().min(0, "Giá không được âm."),
        weekendPrice: z.number().min(0, "Giá không được âm."),
      }),
    ),
  })
  .superRefine((value, context) => {
    value.slotPrices.forEach((slot, index) => {
      if (!Number.isFinite(slot.weekdayPrice)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["slotPrices", index, "weekdayPrice"],
          message: "Giá ngày thường phải là số hợp lệ.",
        });
      }
      if (!Number.isFinite(slot.weekendPrice)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["slotPrices", index, "weekendPrice"],
          message: "Giá cuối tuần phải là số hợp lệ.",
        });
      }
    });
  });
