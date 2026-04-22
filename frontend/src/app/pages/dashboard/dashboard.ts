import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
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
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
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

  private minLat = 43.15;
  private maxLat = 43.37;
  private minLng = 76.78;
  private maxLng = 77.05;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
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
        console.log('Dashboard stations:', stations);
        console.log('Dashboard summary:', summary);
        console.log('Dashboard readings:', readings);

        this.buildDashboard(stations ?? [], summary ?? [], readings ?? []);
        this.isLoading = false;
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
      (d) => d.latitude !== null && d.longitude !== null
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

    const total = filtered.reduce((sum, reading) => sum + Number(reading.aqi ?? 0), 0);
    return Math.round(total / filtered.length);
  }

  mapCategoryToStatus(category: string | undefined): string {
    if (!category) return 'Moderate';

    const normalized = category.toLowerCase();

    if (normalized === 'good') return 'Good';
    if (normalized === 'moderate') return 'Moderate';
    return 'Unhealthy';
  }

  getMarkerClass(status: string): string {
    if (status === 'Good') return 'marker-good';
    if (status === 'Moderate') return 'marker-moderate';
    return 'marker-unhealthy';
  }

  getBadgeClass(status: string): string {
    if (status === 'Good') return 'good';
    if (status === 'Moderate') return 'moderate';
    return 'unhealthy';
  }

  getMarkerLeft(lng: number | null): string {
    if (lng === null) return '50%';
    const percent = ((lng - this.minLng) / (this.maxLng - this.minLng)) * 100;
    return `${Math.min(Math.max(percent, 6), 94)}%`;
  }

  getMarkerTop(lat: number | null): string {
    if (lat === null) return '50%';
    const percent = ((this.maxLat - lat) / (this.maxLat - this.minLat)) * 100;
    return `${Math.min(Math.max(percent, 8), 92)}%`;
  }
}