import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeographicProvider } from '../interfaces/geographic-provider.interface';
import {
  DestinationSearchQueryDto,
  DestinationResultDto,
} from '../dto/destination-search.dto';

export interface LocationIqAddress {
  university?: string;
  college?: string;
  building?: string;
  suburb?: string;
  quarter?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  house_number?: string;
  neighbourhood?: string;
  amenity?: string;
  [key: string]: string | undefined;
}

export interface LocationIqRawItem {
  place_id?: string | number;
  osm_id?: string | number;
  osm_type?: string;
  display_name?: string;
  name?: string;
  class?: string;
  type?: string;
  lat?: string;
  lon?: string;
  address?: LocationIqAddress;
  [key: string]: unknown;
}

@Injectable()
export class LocationIqProvider implements GeographicProvider {
  private readonly logger = new Logger(LocationIqProvider.name);
  private readonly LOCATIONIQ_URL =
    'https://us1.locationiq.com/v1/autocomplete';

  constructor(private readonly configService: ConfigService) {}

  async search(
    queryDto: DestinationSearchQueryDto,
  ): Promise<DestinationResultDto[]> {
    const apiKey = this.configService.get<string>('LOCATIONIQ_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'LOCATIONIQ_API_KEY environment variable is not configured. Skipping geographic search.',
      );
      return [];
    }

    const trimmed = queryDto.q.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      key: apiKey,
      q: trimmed,
      countrycodes: 'eg',
      'accept-language': 'ar,en',
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
      const url = `${this.LOCATIONIQ_URL}?${params.toString()}`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Makook-Delivery-Backend/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logger.warn(
            'LocationIQ authorization error (invalid or missing API key).',
          );
        } else if (response.status === 429) {
          this.logger.warn('LocationIQ rate limit exceeded (HTTP 429).');
        } else {
          this.logger.warn(`LocationIQ HTTP error: ${response.status}`);
        }
        return [];
      }

      const rawResults: unknown = await response.json();
      if (!Array.isArray(rawResults)) {
        return [];
      }

      return (rawResults as LocationIqRawItem[])
        .map((item, index) => this.normalizePlace(item, index))
        .filter((item): item is DestinationResultDto => item !== null);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const isAbortError =
        error instanceof Error && error.name === 'AbortError';
      if (isAbortError) {
        this.logger.warn('LocationIQ search timed out after 8 seconds');
      } else {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error('LocationIQ provider search error:', message);
      }
      return [];
    }
  }

  private normalizePlace(
    item: LocationIqRawItem | null | undefined,
    index: number,
  ): DestinationResultDto | null {
    if (!item) return null;

    const title =
      item.name ||
      (item.display_name
        ? item.display_name.split(',')[0].trim()
        : 'Selected Location');
    const addressSubtitle = item.display_name || '';
    const address: LocationIqAddress = item.address || {};

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
    } else if (
      rawType.includes('shop') ||
      rawType.includes('store') ||
      rawType.includes('supermarket') ||
      rawType.includes('restaurant') ||
      rawType.includes('pharmacy')
    ) {
      category = 'Store';
      type = 'store';
    }

    const latNum = typeof item.lat === 'string' ? parseFloat(item.lat) : NaN;
    const lonNum = typeof item.lon === 'string' ? parseFloat(item.lon) : NaN;

    if (isNaN(latNum) || isNaN(lonNum)) {
      return null;
    }

    return {
      id: `locationiq-${item.place_id || item.osm_id || index}`,
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
