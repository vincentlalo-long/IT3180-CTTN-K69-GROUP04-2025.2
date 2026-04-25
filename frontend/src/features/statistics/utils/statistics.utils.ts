export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)} tỷ VNĐ`;
  }

  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} triệu VNĐ`;
  }

  return `${amount.toLocaleString("vi-VN")} VNĐ`;
}

export function formatVacancyRate(vacancyRate: string | number): string {
  if (typeof vacancyRate === "number") {
    return `${vacancyRate.toFixed(1)}%`;
  }

  return vacancyRate;
}

export function resolveDashboardFacilityId(
  selectedFacilityId: string,
  apiFacilityId?: string,
): string | "ALL" {
  if (selectedFacilityId === "all") {
    return "ALL";
  }

  if (/^\d+$/.test(selectedFacilityId)) {
    return selectedFacilityId;
  }

  if (apiFacilityId && /^\d+$/.test(apiFacilityId)) {
    return apiFacilityId;
  }

  return "ALL";
}
