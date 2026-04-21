import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  summaryCards = [
    { title: 'Average AQI', value: 78, status: 'Moderate' },
    { title: 'Safest District', value: 'Nauryzbay', status: 'Good' },
    { title: 'Most Polluted', value: 'Turksib', status: 'Unhealthy' },
    { title: 'Active Districts', value: 8, status: 'Live' }
  ];

  trends = [
    { period: 'Today', value: '78 AQI' },
    { period: 'This Week', value: '84 AQI' },
    { period: 'This Month', value: '89 AQI' }
  ];
}