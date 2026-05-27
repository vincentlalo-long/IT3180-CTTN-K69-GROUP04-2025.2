import axios from "axios";

const DEFAULT_ERROR_MESSAGE = "Co loi xay ra. Vui long thu lai.";

const getStringValue = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const extractMessageFromResponse = (data: unknown): string | null => {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as Record<string, unknown>;
  const message = getStringValue(payload.message);
  const error = getStringValue(payload.error);
  const detail = getStringValue(payload.detail);

  if (error && message) {
    return `${error}: ${message}`;
  }

  return message ?? error ?? detail;
};

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string = DEFAULT_ERROR_MESSAGE,
): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = extractMessageFromResponse(error.response?.data);
    if (responseMessage) {
      return responseMessage;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function logApiError(
  context: string,
  error: unknown,
  details: Record<string, unknown> = {},
): void {
  const message = getApiErrorMessage(error);
  if (axios.isAxiosError(error)) {
    console.error(`[API Error] ${context}`, {
      message,
      status: error.response?.status,
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      response: error.response?.data,
      ...details,
    });
    return;
  }

  console.error(`[API Error] ${context}`, {
    message,
    error,
    ...details,
  });
}
