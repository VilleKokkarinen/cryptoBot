import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyStochasticComponent } from './strategy-stochastic.component';

describe('StrategyStochasticComponent', () => {
  let component: StrategyStochasticComponent;
  let fixture: ComponentFixture<StrategyStochasticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrategyStochasticComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StrategyStochasticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
