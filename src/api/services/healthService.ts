import { apiGet } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { HealthDto } from '@/types/api';

export async function getHealth(): Promise<HealthDto> {
  return apiGet<HealthDto>(ENDPOINTS.HEALTH);
}
