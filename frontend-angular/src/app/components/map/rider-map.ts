import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  signal,
} from '@angular/core';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OsrmRoute {
  geometry: {
    coordinates: [number, number][]; // GeoJSON: [lon, lat]
  };
  distance: number; // in meters
  duration: number; // in seconds
}

export interface OsrmResponse {
  code: string;
  routes: OsrmRoute[];
}

export interface RouteCalculatedEvent {
  durationText: string | null;
  distanceText: string | null;
  error: string | null;
}

const calculateHaversineMeters = (c1: Coordinates | null, c2: Coordinates | null): number => {
  if (!c1 || !c2) return 0;
  const R = 6371000;
  const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
  const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.latitude * Math.PI) / 180) *
      Math.cos((c2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDuration = (seconds: number): string | null => {
  if (seconds == null || isNaN(seconds) || seconds <= 0) return null;
  const totalMinutes = Math.ceil(seconds / 60);

  if (totalMinutes < 60) {
    return totalMinutes <= 1 ? '~1 min' : `~${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  if (remainingMins === 0) {
    return `~${hours} hr`;
  }
  return `~${hours} hr ${remainingMins} min`;
};

const formatDistance = (meters: number): string | null => {
  if (meters == null || isNaN(meters) || meters <= 0) return null;
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

@Component({
  selector: 'app-rider-map',
  standalone: true,
  templateUrl: './rider-map.html',
  styleUrl: './rider-map.css',
})
export class RiderMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() riderCoords: Coordinates | null = null;
  @Input() pickupCoords: Coordinates | null = null;
  @Input() destinationCoords: Coordinates | null = null;
  @Input() status: string | undefined = 'ACCEPTED';

  @Output() routeCalculated = new EventEmitter<RouteCalculatedEvent>();

  readonly mapReady = signal<boolean>(false);

  private mapInstance: L.Map | null = null;
  private riderMarker: L.Marker | null = null;
  private pickupMarker: L.Marker | null = null;
  private destMarker: L.Marker | null = null;
  private polylineLayer: L.Polyline | null = null;

  private lastRoutedOrigin: Coordinates | null = null;
  private lastRequestTime = 0;
  private lastTargetKey = '';
  private currentRequestSequence = 0;
  private isDestroyed = false;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initLeafletMap();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.mapInstance && this.mapReady()) {
      if (changes['riderCoords']) {
        this.updateRiderMarkerPosition();
      }
      if (changes['pickupCoords'] || changes['destinationCoords'] || changes['status']) {
        this.updateFixedMarkers();
      }
      this.evaluateRouteRecalculation();
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.clearPolyline();
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  }

  private initLeafletMap(): void {
    if (this.isDestroyed || !this.mapContainer?.nativeElement || this.mapInstance) return;

    const defaultCenter: [number, number] = this.pickupCoords
      ? [this.pickupCoords.latitude, this.pickupCoords.longitude]
      : this.destinationCoords
        ? [this.destinationCoords.latitude, this.destinationCoords.longitude]
        : this.riderCoords
          ? [this.riderCoords.latitude, this.riderCoords.longitude]
          : [26.1551, 32.716];

    try {
      this.mapInstance = L.map(this.mapContainer.nativeElement, {
        center: defaultCenter,
        zoom: 15,
        zoomControl: true,
      });

      const tileUrl =
        environment.osm?.tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const attribution = environment.osm?.attribution || '© OpenStreetMap contributors';

      L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 19,
      }).addTo(this.mapInstance);

      this.mapReady.set(true);

      (window as unknown as Record<string, unknown>)['__RIDER_MAP_DIAGNOSTICS__'] = {
        mapInstance: this.mapInstance,
        container: this.mapContainer?.nativeElement,
        pickup: this.pickupCoords,
        destination: this.destinationCoords,
        rider: this.riderCoords,
        size: this.mapInstance?.getSize(),
      };
      console.log(
        '[RiderMap Diagnostic] Map initialized successfully:',
        (window as unknown as Record<string, unknown>)['__RIDER_MAP_DIAGNOSTICS__'],
      );

      setTimeout(() => {
        if (this.mapInstance) {
          this.mapInstance.invalidateSize();
        }
      }, 100);

      this.updateFixedMarkers();
      this.updateRiderMarkerPosition();
      this.evaluateRouteRecalculation();
    } catch (err) {
      console.error('[RiderMap] Initialization error:', err);
    }
  }

  private createCustomIcon(emoji: string, className: string): L.DivIcon {
    return L.divIcon({
      className: `rider-leaflet-emoji-marker ${className}`,
      html: `<div class="marker-emoji-inner">${emoji}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  }

  private updateFixedMarkers(): void {
    if (!this.mapInstance) return;
    const bounds: [number, number][] = [];

    if (this.pickupCoords && Number.isFinite(this.pickupCoords.latitude)) {
      const pPos: [number, number] = [this.pickupCoords.latitude, this.pickupCoords.longitude];
      if (!this.pickupMarker) {
        this.pickupMarker = L.marker(pPos, {
          icon: this.createCustomIcon('📍', 'pickup-marker'),
          title: 'Pickup Point',
        }).addTo(this.mapInstance);
      } else {
        this.pickupMarker.setLatLng(pPos);
      }
      bounds.push(pPos);
    }

    if (this.destinationCoords && Number.isFinite(this.destinationCoords.latitude)) {
      const dPos: [number, number] = [
        this.destinationCoords.latitude,
        this.destinationCoords.longitude,
      ];
      if (!this.destMarker) {
        this.destMarker = L.marker(dPos, {
          icon: this.createCustomIcon('🏁', 'dest-marker'),
          title: 'Destination',
        }).addTo(this.mapInstance);
      } else {
        this.destMarker.setLatLng(dPos);
      }
      bounds.push(dPos);
    }

    if (
      bounds.length > 0 &&
      !(this.mapInstance as unknown as { _initialFitted?: boolean })._initialFitted
    ) {
      this.mapInstance.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
      (this.mapInstance as unknown as { _initialFitted?: boolean })._initialFitted = true;
    }
  }

  private updateRiderMarkerPosition(): void {
    if (!this.mapInstance) return;

    if (this.riderCoords && Number.isFinite(this.riderCoords.latitude)) {
      const rPos: [number, number] = [this.riderCoords.latitude, this.riderCoords.longitude];
      if (!this.riderMarker) {
        this.riderMarker = L.marker(rPos, {
          icon: this.createCustomIcon('🛵', 'rider-marker'),
          title: 'Rider Current Location',
          zIndexOffset: 1000,
        }).addTo(this.mapInstance);
      } else {
        this.riderMarker.setLatLng(rPos);
      }
    }
  }

  private getTargetCoords(): Coordinates | null {
    if (this.status === 'ACCEPTED') {
      return this.pickupCoords;
    }
    if (this.status === 'PICKED_UP') {
      return this.destinationCoords;
    }
    return null;
  }

  private evaluateRouteRecalculation(): void {
    if (this.status !== 'ACCEPTED' && this.status !== 'PICKED_UP') {
      this.clearPolyline();
      this.routeCalculated.emit({ durationText: null, distanceText: null, error: null });
      return;
    }

    const target = this.getTargetCoords();
    if (!this.riderCoords || !target) return;

    const targetKey = `${this.status}_${target.latitude}_${target.longitude}`;
    const targetChanged = this.lastTargetKey !== targetKey;
    const now = Date.now();
    const timeElapsed = now - this.lastRequestTime;
    const distanceMoved = calculateHaversineMeters(this.lastRoutedOrigin, this.riderCoords);

    let needsRecalculation = false;

    if (!this.lastRoutedOrigin || !this.lastRequestTime || targetChanged) {
      needsRecalculation = true;
    } else if (timeElapsed >= 60000) {
      needsRecalculation = true;
    } else if (timeElapsed >= 20000 && distanceMoved >= 150) {
      needsRecalculation = true;
    }

    if (needsRecalculation) {
      this.lastRequestTime = now;
      this.lastRoutedOrigin = { ...this.riderCoords };
      this.lastTargetKey = targetKey;
      this.fetchOsrmRoute(this.riderCoords, target);
    }
  }

  private async fetchOsrmRoute(origin: Coordinates, destination: Coordinates): Promise<void> {
    const sequenceId = ++this.currentRequestSequence;
    const baseUrl = environment.osrm?.baseUrl || 'https://router.project-osrm.org';

    const url = `${baseUrl}/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson&steps=false`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OSRM HTTP Error ${response.status}`);
      }

      const data: OsrmResponse = await response.json();

      if (this.isDestroyed || sequenceId !== this.currentRequestSequence) {
        return;
      }

      if (data && data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const primaryRoute = data.routes[0];
        const durationText = formatDuration(primaryRoute.duration);
        const distanceText = formatDistance(primaryRoute.distance);

        const leafletCoords: [number, number][] = primaryRoute.geometry.coordinates.map(
          ([lon, lat]) => [lat, lon],
        );

        this.renderPolyline(leafletCoords);
        this.routeCalculated.emit({ durationText, distanceText, error: null });
      } else {
        this.routeCalculated.emit({
          durationText: null,
          distanceText: null,
          error: 'Route unavailable',
        });
      }
    } catch (err) {
      console.warn('[RiderMap] OSRM request failed:', err);
      if (!this.isDestroyed && sequenceId === this.currentRequestSequence) {
        this.routeCalculated.emit({
          durationText: null,
          distanceText: null,
          error: 'Route unavailable',
        });
      }
    }
  }

  private renderPolyline(coords: [number, number][]): void {
    this.clearPolyline();
    if (!this.mapInstance || !coords || coords.length === 0) return;

    this.polylineLayer = L.polyline(coords, {
      color: '#156B82',
      weight: 5,
      opacity: 0.85,
    }).addTo(this.mapInstance);
  }

  private clearPolyline(): void {
    if (this.polylineLayer && this.mapInstance) {
      this.mapInstance.removeLayer(this.polylineLayer);
      this.polylineLayer = null;
    }
  }
}
