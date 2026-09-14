import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import * as L from 'leaflet';
import { environment } from '../../../../../environments/environment';
import { DashboardService } from '../../../../services/dashboard/dashboard.service';
import { HeatmapPoint } from '../../../../models/dashboard/order.models';

@Component({
  selector: 'app-heatmap-placeholder',
  standalone: true,
  templateUrl: './heatmap-placeholder.html',
  styleUrl: './heatmap-placeholder.css',
})
export class HeatmapPlaceholderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  private readonly dashboardService = inject(DashboardService);

  readonly points = this.dashboardService.heatmapPoints;
  readonly loading = this.dashboardService.heatmapLoading;
  readonly error = this.dashboardService.heatmapError;

  readonly mapReady = signal<boolean>(false);

  private mapInstance: L.Map | null = null;
  private heatmapLayerGroup: L.LayerGroup | null = null;
  private isDestroyed = false;

  constructor() {
    effect(() => {
      const currentPoints = this.points();
      if (this.mapReady() && !this.isDestroyed) {
        this.renderHeatmapOverlay(currentPoints);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initLeafletMap();
    }, 0);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.clearOverlay();
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  }

  refreshData(): void {
    this.dashboardService.fetchHeatmapData();
  }

  private initLeafletMap(): void {
    if (this.isDestroyed || !this.mapContainer?.nativeElement || this.mapInstance) return;

    // South Valley University default campus center
    const campusCenter: [number, number] = [26.1551, 32.716];

    try {
      this.mapInstance = L.map(this.mapContainer.nativeElement, {
        center: campusCenter,
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

      this.heatmapLayerGroup = L.layerGroup().addTo(this.mapInstance);
      this.mapReady.set(true);

      setTimeout(() => {
        if (this.mapInstance) {
          this.mapInstance.invalidateSize();
        }
      }, 100);

      this.renderHeatmapOverlay(this.points());
    } catch (err) {
      console.error('[CampusHeatmap] Map initialization error:', err);
    }
  }

  private renderHeatmapOverlay(points: HeatmapPoint[]): void {
    if (!this.mapInstance || !this.heatmapLayerGroup) return;

    this.clearOverlay();

    if (!points || points.length === 0) {
      return;
    }

    const bounds: [number, number][] = [];

    points.forEach((point) => {
      if (
        typeof point.latitude !== 'number' ||
        typeof point.longitude !== 'number' ||
        !Number.isFinite(point.latitude) ||
        !Number.isFinite(point.longitude)
      ) {
        return;
      }

      const pos: [number, number] = [point.latitude, point.longitude];
      bounds.push(pos);

      const color = this.getZoneColor(point.intensity);
      const radiusMeters = this.getZoneRadius(point.intensity);

      // Render Leaflet circle representing localized campus demand zone
      const circle = L.circle(pos, {
        radius: radiusMeters,
        color: color,
        fillColor: color,
        fillOpacity: 0.45,
        weight: 2,
      });

      circle.bindTooltip(
        `<div style="font-family: inherit; padding: 2px 4px;">
          <strong>Demand Zone</strong><br/>
          Intensity Score: <strong>${point.intensity}</strong>
        </div>`,
        { permanent: false, direction: 'top' },
      );

      this.heatmapLayerGroup?.addLayer(circle);
    });

    if (
      bounds.length > 0 &&
      !(this.mapInstance as unknown as { _heatmapFitted?: boolean })._heatmapFitted
    ) {
      this.mapInstance.fitBounds(L.latLngBounds(bounds), { padding: [30, 30] });
      (this.mapInstance as unknown as { _heatmapFitted?: boolean })._heatmapFitted = true;
    }
  }

  private clearOverlay(): void {
    if (this.heatmapLayerGroup) {
      this.heatmapLayerGroup.clearLayers();
    }
  }

  private getZoneColor(intensity: number): string {
    if (intensity > 3.5) {
      return '#EF4444'; // High Demand (Red)
    }
    if (intensity > 1.5) {
      return '#F59E0B'; // Medium Demand (Amber)
    }
    return '#156B82'; // Low Demand (Teal/Blue)
  }

  private getZoneRadius(intensity: number): number {
    if (intensity > 3.5) return 60;
    if (intensity > 1.5) return 45;
    return 30;
  }
}
