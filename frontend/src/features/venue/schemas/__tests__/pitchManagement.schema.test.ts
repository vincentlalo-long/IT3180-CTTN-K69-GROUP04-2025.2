import { venueFormSchema, pitchFormSchema } from "../pitchManagement.schema";

describe("venueFormSchema", () => {
  it("accepts valid venue data", () => {
    const result = venueFormSchema.safeParse({
      venueName: "Sân ABC",
      venueAddress: "123 Đường ABC",
      venueDescription: "Mô tả",
      imageFile: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts venue data without optional fields", () => {
    const result = venueFormSchema.safeParse({
      venueName: "Sân ABC",
      venueAddress: "123 Đường ABC",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty venue name", () => {
    const result = venueFormSchema.safeParse({
      venueName: "",
      venueAddress: "123 Đường ABC",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes("venueName"));
      expect(nameError).toBeDefined();
    }
  });

  it("rejects whitespace-only venue name", () => {
    const result = venueFormSchema.safeParse({
      venueName: "   ",
      venueAddress: "123 Đường ABC",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty venue address", () => {
    const result = venueFormSchema.safeParse({
      venueName: "Sân ABC",
      venueAddress: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const addressError = result.error.issues.find((i) =>
        i.path.includes("venueAddress"),
      );
      expect(addressError).toBeDefined();
    }
  });

  it("accepts a File object as imageFile", () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    const result = venueFormSchema.safeParse({
      venueName: "Sân ABC",
      venueAddress: "123 Đường ABC",
      imageFile: file,
    });
    expect(result.success).toBe(true);
  });
});

describe("pitchFormSchema", () => {
  const validSlotPrices = [
    { slotLabel: "06:30-08:00", weekdayPrice: 300000, weekendPrice: 400000 },
    { slotLabel: "08:00-09:30", weekdayPrice: 300000, weekendPrice: 400000 },
  ];

  it("accepts valid pitch data", () => {
    const result = pitchFormSchema.safeParse({
      pitchName: "Sân 1",
      pitchType: "5vs5",
      slotPrices: validSlotPrices,
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid pitch types", () => {
    for (const type of ["5vs5", "7vs7", "11vs11"]) {
      const result = pitchFormSchema.safeParse({
        pitchName: "Sân 1",
        pitchType: type,
        slotPrices: validSlotPrices,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects empty pitch name", () => {
    const result = pitchFormSchema.safeParse({
      pitchName: "",
      pitchType: "5vs5",
      slotPrices: validSlotPrices,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid pitch type", () => {
    const result = pitchFormSchema.safeParse({
      pitchName: "Sân 1",
      pitchType: "3vs3",
      slotPrices: validSlotPrices,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative weekday price", () => {
    const result = pitchFormSchema.safeParse({
      pitchName: "Sân 1",
      pitchType: "5vs5",
      slotPrices: [
        { slotLabel: "06:30-08:00", weekdayPrice: -1000, weekendPrice: 400000 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative weekend price", () => {
    const result = pitchFormSchema.safeParse({
      pitchName: "Sân 1",
      pitchType: "5vs5",
      slotPrices: [
        { slotLabel: "06:30-08:00", weekdayPrice: 300000, weekendPrice: -1000 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero prices", () => {
    const result = pitchFormSchema.safeParse({
      pitchName: "Sân 1",
      pitchType: "7vs7",
      slotPrices: [
        { slotLabel: "06:30-08:00", weekdayPrice: 0, weekendPrice: 0 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects NaN prices", () => {
    const result = pitchFormSchema.safeParse({
      pitchName: "Sân 1",
      pitchType: "7vs7",
      slotPrices: [
        { slotLabel: "06:30-08:00", weekdayPrice: NaN, weekendPrice: 300000 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects Infinity prices", () => {
    const result = pitchFormSchema.safeParse({
      pitchName: "Sân 1",
      pitchType: "7vs7",
      slotPrices: [
        { slotLabel: "06:30-08:00", weekdayPrice: Infinity, weekendPrice: 300000 },
      ],
    });
    expect(result.success).toBe(false);
  });
});
