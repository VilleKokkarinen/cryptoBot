import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyMacdComponent } from './strategy-macd.component';

describe('StrategyMacdComponent', () => {
  let component: StrategyMacdComponent;
  let fixture: ComponentFixture<StrategyMacdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrategyMacdComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StrategyMacdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
