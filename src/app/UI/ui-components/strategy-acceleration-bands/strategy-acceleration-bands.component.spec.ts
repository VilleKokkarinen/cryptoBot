import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyAccelerationBandsComponent } from './strategy-acceleration-bands.component';

describe('StrategyAccelerationBandsComponent', () => {
  let component: StrategyAccelerationBandsComponent;
  let fixture: ComponentFixture<StrategyAccelerationBandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrategyAccelerationBandsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StrategyAccelerationBandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
