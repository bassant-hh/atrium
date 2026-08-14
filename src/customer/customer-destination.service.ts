import { Injectable, Logger } from '@nestjs/common';
import {
  DestinationSearchQueryDto,
  DestinationResultDto,
} from './dto/destination-search.dto';

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
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

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

    const params = new URLSearchParams({
      format: 'json',
      q: trimmed,
      addressdetails: '1',
      limit: '6',
    });

    if (queryDto.latitude !== undefined && queryDto.longitude !== undefined) {
      const delta = 0.5; // ~50km radius bias
      const lat = queryDto.latitude;
      const lon = queryDto.longitude;
      params.append(
        'viewbox',
        `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`,
      );
      params.append('bounded', '0');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const url = `${this.NOMINATIM_URL}?${params.toString()}`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Makook-Delivery-Backend/1.0 (contact@makook.delivery)',
          'Accept-Language': 'en',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.warn(`Geographic provider HTTP error: ${response.status}`);
        return [];
      }

      const rawResults = await response.json();
      if (!Array.isArray(rawResults)) {
        return [];
      }

      const normalized: DestinationResultDto[] = rawResults
        .map((item, index) => this.normalizePlace(item, index))
        .filter((item): item is DestinationResultDto => item !== null);

      // Maintain cache size
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

      return normalized;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        this.logger.warn('Geographic provider search timed out after 8s');
      } else {
        this.logger.error(
          'Geographic provider search error:',
          error.message || error,
        );
      }
      return [];
    }
  }

  private normalizePlace(
    item: any,
    index: number,
  ): DestinationResultDto | null {
    if (!item) return null;

    const title =
      item.name ||
      (item.display_name
        ? item.display_name.split(',')[0].trim()
        : 'Selected Location');
    const addressSubtitle = item.display_name || '';
    const address = item.address || {};

    const university = address.university || address.college || '';
    const faculty = address.building || address.suburb || address.quarter || '';
    const street = address.road || address.pedestrian || address.footway || '';
    const building = address.house_number || '';
    const landmark =
      address.neighbourhood || address.suburb || address.amenity || '';

    let category = 'LOCATION';
    let type = 'home';
    const rawType = (item.type || item.class || '').toLowerCase();

    if (
      rawType.includes('university') ||
      rawType.includes('school') ||
      rawType.includes('college')
    ) {
      category = 'Campus';
      type = 'campus';
    } else if (
      rawType.includes('hospital') ||
      rawType.includes('office') ||
      rawType.includes('commercial')
    ) {
      category = 'Office';
      type = 'office';
    }

    const latNum = parseFloat(item.lat);
    const lonNum = parseFloat(item.lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return null;
    }

    return {
      id: `geo-${item.place_id || index}`,
      name: title,
      displayTitle: title,
      displaySub: addressSubtitle,
      category,
      type,
      fields: {
        university,
        faculty,
        deliveryPoint: title,
        street,
        building,
        floor: '',
        apartment: '',
        officeName: '',
        landmark,
      },
      coords: {
        latitude: Number(latNum.toFixed(6)),
        longitude: Number(lonNum.toFixed(6)),
      },
      address: addressSubtitle,
      fullAddress: addressSubtitle,
    };
  }
}
