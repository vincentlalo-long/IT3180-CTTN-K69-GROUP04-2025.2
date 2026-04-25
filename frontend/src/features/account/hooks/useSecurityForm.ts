import { useState, type FormEvent } from "react";

import { securitySchema } from "../schemas/security.schema";
import { defaultSecurityForm } from "../utils/security.utils";
import type { SecurityFormData } from "../types/security.types";

export function useSecurityForm() {
  const [securityForm, setSecurityForm] =
    useState<SecurityFormData>(defaultSecurityForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const updateField = <Key extends keyof SecurityFormData>(
    key: Key,
    value: SecurityFormData[Key],
  ) => {
    setSecurityForm((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationResult = securitySchema.safeParse(securityForm);
    if (!validationResult.success) {
      setFormError(validationResult.error.issues[0]?.message ?? null);
      return;
    }

    setFormError(null);
    setIsSaving(true);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 700);
    });

    setIsSaving(false);
    setSecurityForm(defaultSecurityForm);
  };

  return {
    securityForm,
    isSaving,
    formError,
    updateField,
    handleSubmit,
  };
}
