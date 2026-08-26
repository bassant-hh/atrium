import { Injectable, Logger } from '@nestjs/common';
import {
  DestinationSearchQueryDto,
  DestinationResultDto,
} from './dto/destination-search.dto';
import { LocationIqProvider } from './providers/locationiq.provider';

interface CacheEntry {
  timestamp: number;
  data: DestinationResultDto[];
}

@Injectable()
export class CustomerDestinationService {
  private readonly logger = new Logger(CustomerDestinationService.name);
  private readonly searchCache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_CACHE_ENTRIES = 200;

  constructor(private readonly locationIqProvider: LocationIqProvider) {}

  async searchDestinations(
    queryDto: DestinationSearchQueryDto,
  ): Promise<DestinationResultDto[]> {
    const trimmed = queryDto.q.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    const latStr =
      queryDto.latitude !== undefined ? queryDto.latitude.toFixed(2) : 'none';
    const lonStr =
      queryDto.longitude !== undefined ? queryDto.longitude.toFixed(2) : 'none';
    const cacheKey = `${trimmed.toLowerCase()}_lat${latStr}_lon${lonStr}`;

    // Check server-side cache
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const normalized = await this.locationIqProvider.search(queryDto);

    // Only cache successful non-empty results to prevent transient failures/rate-limits from poisoning cache
    if (normalized && normalized.length > 0) {
      if (this.searchCache.size >= this.MAX_CACHE_ENTRIES) {
        const oldestKey = this.searchCache.keys().next().value;
        if (oldestKey) {
          this.searchCache.delete(oldestKey);
        }
      }

      this.searchCache.set(cacheKey, {
        timestamp: Date.now(),
        data: normalized,
      });
    }

    return normalized;
  }
}
