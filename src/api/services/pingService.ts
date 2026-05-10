import { apiGet } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { PingDto } from '@/types/api';

export async function ping(): Promise<PingDto> {
  return apiGet<PingDto>(ENDPOINTS.PING);
}
