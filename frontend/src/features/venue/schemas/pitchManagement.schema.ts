import { z } from "zod";

import {
  createAreaOptionValue,
  pitchTypeOptions,
} from "../utils/pitchManagement.utils";

export const pitchManagementSchema = z
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