import { useState, type FormEvent } from "react";

import { defaultProfileForm } from "../utils/profile.utils";
import type { ProfileFormData } from "../types/profile.types";

export function useProfileForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] =
    useState<ProfileFormData>(defaultProfileForm);

  const updateProfileField = <Key extends keyof ProfileFormData>(
    key: Key,
    value: ProfileFormData[Key],
  ) => {
    setProfileForm((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 700);
    });

    setIsSaving(false);
  };

  return {
    isSaving,
    profileForm,
    handleSubmit,
    updateProfileField,
  };
}