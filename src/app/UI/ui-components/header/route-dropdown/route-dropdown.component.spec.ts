import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteDropdownComponent } from './route-dropdown.component';

describe('RouteDropdownComponent', () => {
  let component: RouteDropdownComponent;
  let fixture: ComponentFixture<RouteDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
