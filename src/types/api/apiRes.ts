export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: Record<string, string[]>;
}
