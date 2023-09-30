import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartXBTComponent } from './chart.component';

describe('ChartComponent', () => {
  let component: ChartXBTComponent;
  let fixture: ComponentFixture<ChartXBTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartXBTComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartXBTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
