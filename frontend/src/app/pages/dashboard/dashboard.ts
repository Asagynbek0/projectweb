import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import * as L from 'leaflet';
import { ApiService, Reading, Station } from '../../services/api';

interface DashboardDistrict {
  id: number;
  name: string;
  aqi: number;
  status: string;
  latitude: number | null;
  longitude: number | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, AfterViewInit {
  isLoading = true;
  errorMessage = '';

  districts: DashboardDistrict[] = [];
  mapDistricts: DashboardDistrict[] = [];

  averageAqi = 0;
  activeStations = 0;
  safestDistrict = '—';
  mostPollutedDistrict = '—';

  todayAqi = 0;
  weekAqi = 0;
  monthAqi = 0;

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private viewReady = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryRenderMap();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      stations: this.apiService.getStations(),
      summary: this.apiService.getAirSummary(),
      readings: this.apiService.getReadings()
    }).subscribe({
      next: ({ stations, summary, readings }) => {
        this.buildDashboard(stations ?? [], summary ?? [], readings ?? []);
        this.isLoading = false;
        this.tryRenderMap();
      },
      error: (error) => {
        console.error('Dashboard API error:', error);
        this.errorMessage = 'Could not load dashboard data.';
        this.isLoading = false;
      }
    });
  }

  buildDashboard(stations: Station[], summary: any[], readings: Reading[]): void {
    this.districts = stations.map((station: Station) => {
      const summaryItem = summary.find(
        (item: any) =>
          item.station_name === station.name ||
          item.name === station.name ||
          item.station === station.id
      );

      return {
        id: station.id,
        name: station.name,
        aqi: Number(summaryItem?.latest_aqi ?? station.aqi ?? 0),
        status: this.mapCategoryToStatus(summaryItem?.category ?? station.status),
        latitude:
          station.latitude !== undefined && station.latitude !== null
            ? Number(station.latitude)
            : null,
        longitude:
          station.longitude !== undefined && station.longitude !== null
            ? Number(station.longitude)
            : null
      };
    });

    this.mapDistricts = this.districts.filter(
      (d) =>
        d.latitude !== null &&
        d.longitude !== null &&
        !isNaN(d.latitude) &&
        !isNaN(d.longitude)
    );

    this.activeStations = this.districts.length;

    if (this.districts.length > 0) {
      const validAqi = this.districts.map((d) => d.aqi).filter((aqi) => !isNaN(aqi));
      const total = validAqi.reduce((sum, aqi) => sum + aqi, 0);

      this.averageAqi =
        validAqi.length > 0 ? Math.round(total / validAqi.length) : 0;

      const sorted = [...this.districts].sort((a, b) => a.aqi - b.aqi);
      this.safestDistrict = sorted[0]?.name ?? '—';
      this.mostPollutedDistrict = sorted[sorted.length - 1]?.name ?? '—';
    }

    this.todayAqi = this.calculateAverageForPeriod(readings, 1);
    this.weekAqi = this.calculateAverageForPeriod(readings, 7);
    this.monthAqi = this.calculateAverageForPeriod(readings, 30);
  }

  calculateAverageForPeriod(readings: Reading[], days: number): number {
    if (!readings || readings.length === 0) return 0;

    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - days);

    const filtered = readings.filter((reading: Reading) => {
      const recorded = new Date(reading.recorded_at);
      return !isNaN(recorded.getTime()) && recorded >= start && recorded <= now;
    });

    if (filtered.length === 0) return 0;

    const total = filtered.reduce(
      (sum, reading) => sum + Number(reading.aqi ?? 0),
      0
    );

    return Math.round(total / filtered.length);
  }

  mapCategoryToStatus(category: string | undefined): string {
    if (!category) return 'Moderate';

    const normalized = category.toLowerCase();

    if (normalized === 'good') return 'Good';
    if (normalized === 'moderate') return 'Moderate';
    return 'Unhealthy';
  }

  getBadgeClass(status: string): string {
    if (status === 'Good') return 'good';
    if (status === 'Moderate') return 'moderate';
    return 'unhealthy';
  }

  private tryRenderMap(): void {
    if (!this.viewReady || this.isLoading) return;

    setTimeout(() => {
      this.initMap();
      this.renderMarkers();
      this.map?.invalidateSize();
    }, 300);
  }

  private initMap(): void {
    const mapElement = document.getElementById('dashboard-map');
    if (!mapElement) return;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    this.map = L.map(mapElement).setView([43.238949, 76.889709], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  private renderMarkers(): void {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    if (this.mapDistricts.length === 0) {
      this.map.setView([43.238949, 76.889709], 11);
      return;
    }

    const bounds: L.LatLngTuple[] = [];

    this.mapDistricts.forEach((district) => {
      if (district.latitude === null || district.longitude === null) return;

      const latlng: L.LatLngTuple = [district.latitude, district.longitude];

      const marker = L.circleMarker(latlng, {
        radius: 14,
        fillColor: this.getMarkerColor(district.status),
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      });

      marker.bindPopup(`
        <div style="min-width: 140px">
          <strong>${district.name}</strong><br>
          AQI: ${district.aqi}<br>
          Status: ${district.status}
        </div>
      `);

      marker.addTo(this.markersLayer!);
      bounds.push(latlng);
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  private getMarkerColor(status: string): string {
    if (status === 'Good') return '#22c55e';
    if (status === 'Moderate') return '#f59e0b';
    return '#ef4444';
  }
}