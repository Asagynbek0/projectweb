import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, Reading } from '../../services/api';

@Component({
  selector: 'app-district-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './district-detail.html',
  styleUrl: './district-detail.css'
})
export class DistrictDetail implements OnInit {
  stationId = 0;
  stationName = '';
  latestReading: Reading | null = null;
  errorMessage = '';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.stationId = Number(params.get('id'));
      this.loadStationDetails();
    });
  }

  loadStationDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.latestReading = null;
    this.stationName = '';

    this.apiService.getReadingsByStation(this.stationId).subscribe({
      next: (readings: Reading[]) => {
        if (readings.length > 0) {
          readings.sort(
            (a, b) =>
              new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
          );

          this.latestReading = readings[readings.length - 1];
          this.stationName = this.latestReading.station_name;
        } else {
          this.stationName = `Station ${this.stationId}`;
          this.errorMessage = 'No readings found';
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Error loading data';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  mapCategoryToStatus(category: string | undefined): string {
    if (!category) return 'Moderate';

    const normalized = category.toLowerCase();

    if (normalized === 'good') return 'Good';
    if (normalized === 'moderate') return 'Moderate';
    return 'Unhealthy';
  }
}