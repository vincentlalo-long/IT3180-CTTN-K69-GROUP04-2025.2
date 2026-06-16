import { securitySchema } from "../security.schema";

describe("securitySchema", () => {
  it("accepts valid security data with matching passwords", () => {
    const result = securitySchema.safeParse({
      currentPassword: "oldPassword123",
      newPassword: "newPassword123",
      confirmPassword: "newPassword123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when new password is shorter than 8 characters", () => {
    const result = securitySchema.safeParse({
      currentPassword: "oldPassword123",
      newPassword: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.issues.find((i) =>
        i.path.includes("newPassword"),
      );
      expect(passwordError).toBeDefined();
    }
  });

  it("accepts new password with exactly 8 characters", () => {
    const result = securitySchema.safeParse({
      currentPassword: "old",
      newPassword: "12345678",
      confirmPassword: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when passwords do not match", () => {
    const result = securitySchema.safeParse({
      currentPassword: "oldPassword123",
      newPassword: "newPassword123",
      confirmPassword: "differentPassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find((i) =>
        i.path.includes("confirmPassword"),
      );
      expect(confirmError).toBeDefined();
      expect(confirmError!.message).toContain("khớp");
    }
  });

  it("allows empty current password (not validated by schema)", () => {
    const result = securitySchema.safeParse({
      currentPassword: "",
      newPassword: "newPassword123",
      confirmPassword: "newPassword123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty new password", () => {
    const result = securitySchema.safeParse({
      currentPassword: "old",
      newPassword: "",
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
  });
});
