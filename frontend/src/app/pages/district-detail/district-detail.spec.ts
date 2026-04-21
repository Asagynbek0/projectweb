import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictDetail } from './district-detail';

describe('DistricDetail', () => {
  let component: DistrictDetail;
  let fixture: ComponentFixture<DistrictDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistrictDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistrictDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
