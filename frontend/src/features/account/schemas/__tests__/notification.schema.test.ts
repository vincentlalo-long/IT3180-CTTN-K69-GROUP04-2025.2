import { notificationSchema } from "../notification.schema";

describe("notificationSchema", () => {
  it("validates data with both true", () => {
    const result = notificationSchema.safeParse({
      emailNotification: true,
      appNotification: true,
    });
    expect(result.success).toBe(true);
  });

  it("validates data with both false", () => {
    const result = notificationSchema.safeParse({
      emailNotification: false,
      appNotification: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects data with missing fields", () => {
    const result = notificationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects data with non-boolean values", () => {
    const result = notificationSchema.safeParse({
      emailNotification: "yes",
      appNotification: 1,
    });
    expect(result.success).toBe(false);
  });
});
