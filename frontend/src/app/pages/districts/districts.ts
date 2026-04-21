import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Station } from '../../services/api';

@Component({
  selector: 'app-districts',
  imports: [RouterLink],
  templateUrl: './districts.html',
  styleUrl: './districts.css'
})
export class Districts implements OnInit {
  districts: any[] = [];

  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getStations().subscribe({
      next: (data) => {
        console.log('Stations from API:', data);

        this.districts = data.map((station: Station, index: number) => ({
          id: station.id,
          name: station.name || `Station ${index + 1}`,
          aqi: station.aqi ?? 75,
          status: station.status ?? 'Moderate'
        }));

        this.isLoading = false;
      },
      error: (error) => {
        console.error('API error:', error);

        this.errorMessage = 'Could not load stations from API. Showing local data instead.';

        this.districts = [
          { id: 1, name: 'Almaly', aqi: 42, status: 'Good' },
          { id: 2, name: 'Bostandyk', aqi: 76, status: 'Moderate' },
          { id: 3, name: 'Medeu', aqi: 95, status: 'Moderate' },
          { id: 4, name: 'Turksib', aqi: 134, status: 'Unhealthy' },
          { id: 5, name: 'Auezov', aqi: 88, status: 'Moderate' },
          { id: 6, name: 'Nauryzbay', aqi: 39, status: 'Good' }
        ];

        this.isLoading = false;
      }
    });
  }
}