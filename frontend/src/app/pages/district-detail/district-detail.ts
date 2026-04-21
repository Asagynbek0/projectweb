import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-district-detail',
  imports: [RouterLink],
  templateUrl: './district-detail.html',
  styleUrl: './district-detail.css'
})
export class DistrictDetail {
  districtId: number = 0;

  districts = [
    { id: 1, name: 'Almaly', aqi: 42, status: 'Good', recommendation: 'Great day for walking and outdoor sports.' },
    { id: 2, name: 'Bostandyk', aqi: 76, status: 'Moderate', recommendation: 'Sensitive groups should limit long outdoor activity.' },
    { id: 3, name: 'Medeu', aqi: 95, status: 'Moderate', recommendation: 'Consider reducing outdoor exercise time.' },
    { id: 4, name: 'Turksib', aqi: 134, status: 'Unhealthy', recommendation: 'It is better to stay indoors and wear a mask outside.' },
    { id: 5, name: 'Auezov', aqi: 88, status: 'Moderate', recommendation: 'Outdoor activity is okay, but avoid intense exercise.' },
    { id: 6, name: 'Nauryzbay', aqi: 39, status: 'Good', recommendation: 'Air quality is good and safe for most people.' }
  ];

  selectedDistrict: any;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.districtId = Number(params['id']);
      this.selectedDistrict = this.districts.find(d => d.id === this.districtId);
    });
  }
}