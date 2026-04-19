import { Component } from '@angular/core';

@Component({
  selector: 'app-districts',
  imports: [],
  templateUrl: './districts.html',
  styleUrl: './districts.css'
})
export class Districts {
  districts = [
    { id: 1, name: 'Almaly', aqi: 42, status: 'Good' },
    { id: 2, name: 'Bostandyk', aqi: 76, status: 'Moderate' },
    { id: 3, name: 'Medeu', aqi: 95, status: 'Moderate' },
    { id: 4, name: 'Turksib', aqi: 134, status: 'Unhealthy' },
    { id: 5, name: 'Auezov', aqi: 88, status: 'Moderate' },
    { id: 6, name: 'Nauryzbay', aqi: 39, status: 'Good' }
  ];
}