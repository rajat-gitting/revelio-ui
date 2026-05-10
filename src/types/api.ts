/** Standard JSON envelope when the backend wraps payloads (adjust fields to match your API). */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ErrorResponse {
  status: number | null;
  message: string;
  code: string | null;
}

export interface PingDto {
  message: string;
}

export interface HealthDto {
  status: string;
}
