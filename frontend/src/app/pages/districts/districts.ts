import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-districts',
  imports: [RouterLink],
  templateUrl: './districts.html',
  styleUrl: './districts.css'
})
export class Districts implements OnInit {
  districts = [
    { id: 1, name: 'Almaly', aqi: 42, status: 'Good' },
    { id: 2, name: 'Bostandyk', aqi: 76, status: 'Moderate' },
    { id: 3, name: 'Medeu', aqi: 95, status: 'Moderate' },
    { id: 4, name: 'Turksib', aqi: 134, status: 'Unhealthy' },
    { id: 5, name: 'Auezov', aqi: 88, status: 'Moderate' },
    { id: 6, name: 'Nauryzbay', aqi: 39, status: 'Good' }
  ];

  errorMessage: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getDistricts().subscribe({
      next: (data) => {
        console.log('Districts from API:', data);
      },
      error: (error) => {
        console.error('API error:', error);
        this.errorMessage = 'Could not load districts from API. Showing local data instead.';
      }
    });
  }
}