import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyProjectionOscillatorComponent } from './strategy-projection-oscillator.component';

describe('StrategyProjectionOscillatorComponent', () => {
  let component: StrategyProjectionOscillatorComponent;
  let fixture: ComponentFixture<StrategyProjectionOscillatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrategyProjectionOscillatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StrategyProjectionOscillatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
