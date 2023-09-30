import { Component } from '@angular/core';
import { Route } from 'src/app/components/shared/route';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-route-dropdown',
  templateUrl: './route-dropdown.component.html',
  styleUrls: ['./route-dropdown.component.css']
})
export class RouteDropdownComponent {
  Routes:Route[] = SidebarComponent.Routes;

  constructor() {}
}
