import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyBollingerBandsComponent } from './strategy-bollinger-bands.component';

describe('StrategyBollingerBandsComponent', () => {
  let component: StrategyBollingerBandsComponent;
  let fixture: ComponentFixture<StrategyBollingerBandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrategyBollingerBandsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StrategyBollingerBandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
