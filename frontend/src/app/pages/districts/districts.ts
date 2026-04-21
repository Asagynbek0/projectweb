import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService, Station } from '../../services/api';

@Component({
  selector: 'app-districts',
  imports: [CommonModule, RouterLink],
  templateUrl: './districts.html',
  styleUrl: './districts.css'
})
export class Districts implements OnInit {
  districts: any[] = [];
  errorMessage = '';
  isLoading = true;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    forkJoin({
      stations: this.apiService.getStations(),
      summary: this.apiService.getAirSummary()
    }).subscribe({
      next: ({ stations, summary }) => {
        console.log('Stations:', stations);
        console.log('Summary:', summary);

        this.districts = stations.map((station: Station) => {
          const summaryItem = summary.find(
            (item: any) => item.station_name === station.name
          );

          return {
            id: station.id,
            name: station.name,
            aqi: summaryItem?.latest_aqi ?? 0,
            status: this.mapCategoryToStatus(summaryItem?.category)
          };
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('API error:', error);
        this.errorMessage = 'Failed to load stations.';
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