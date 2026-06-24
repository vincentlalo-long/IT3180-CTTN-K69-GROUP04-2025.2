export interface ActivityLogDto {
  id: number;
  userId: number | null;
  userName: string;
  actionType: string;
  targetType: string;
  targetId: string;
  description: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface ActivityLogResponse {
  content: ActivityLogDto[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
