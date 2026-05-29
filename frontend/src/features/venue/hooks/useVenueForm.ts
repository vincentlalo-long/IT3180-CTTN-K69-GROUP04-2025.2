import { zodResolver } from "@hookform/resolvers/zod";
import {
  useState,
  type ChangeEvent,
  type DragEvent,
  useEffect,
} from "react";
import { useForm } from "react-hook-form";

import { venueFormSchema } from "../schemas/pitchManagement.schema";
import type { VenueFormData } from "../types/pitchManagement.types";

interface UseVenueFormOptions {
  mode: "CREATE" | "EDIT" | null;
  existingVenue: {
    name: string;
    address: string;
    imageUrl: string | null;
  } | null;
}

export function useVenueForm({ mode, existingVenue }: UseVenueFormOptions) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VenueFormData>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      venueName: "",
      venueAddress: "",
      venueDescription: "",
      imageFile: null,
    },
    mode: "onBlur",
  });

  /**
   * Dedicated function to reset the venue form state.
   * Can be called manually from event handlers or conditionally on prop changes.
   */
  const resetVenueForm = (
    targetMode?: "CREATE" | "EDIT" | null,
    targetVenue?: UseVenueFormOptions["existingVenue"]
  ) => {
    const activeMode = targetMode !== undefined ? targetMode : mode;
    const venue = targetVenue !== undefined ? targetVenue : existingVenue;

    if (activeMode === "CREATE") {
      reset({
        venueName: "",
        venueAddress: "",
        venueDescription: "",
        imageFile: null,
      });
      setPreviewUrl(null);
      setPreviewName("");
    } else if (activeMode === "EDIT" && venue) {
      reset({
        venueName: venue.name,
        venueAddress: venue.address,
        venueDescription: "",
        imageFile: null,
      });
      setPreviewUrl(venue.imageUrl);
      setPreviewName("");
    } else {
      reset({
        venueName: "",
        venueAddress: "",
        venueDescription: "",
        imageFile: null,
      });
      setPreviewUrl(null);
      setPreviewName("");
    }
  };

  // Sync state during render when mode or existingVenue changes (official React alternative to useEffect)
  const [prevMode, setPrevMode] = useState<"CREATE" | "EDIT" | null>(mode);
  const [prevVenue, setPrevVenue] = useState<UseVenueFormOptions["existingVenue"]>(existingVenue);

  const hasVenueChanged =
    existingVenue?.name !== prevVenue?.name ||
    existingVenue?.address !== prevVenue?.address ||
    existingVenue?.imageUrl !== prevVenue?.imageUrl;

  if (mode !== prevMode || hasVenueChanged) {
    setPrevMode(mode);
    setPrevVenue(existingVenue);
    resetVenueForm(mode, existingVenue);
  }

  // Cleanup object URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const updatePreviewFromFile = (file: File | null) => {
    if (!file) {
      if (mode === "EDIT" && existingVenue?.imageUrl) {
        setPreviewUrl(existingVenue.imageUrl);
      } else {
        setPreviewUrl(null);
      }
      setPreviewName("");
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
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

  const imageFileField = register("imageFile");

  return {
    register,
    handleSubmit,
    errors,
    imageFileField,
    handleImageChange,
    handleImageDrop,
    isDragActive,
    setIsDragActive,
    previewUrl,
    previewName,
    resetVenueForm,
  };
}
