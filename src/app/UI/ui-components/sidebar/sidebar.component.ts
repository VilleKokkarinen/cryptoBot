import { Component } from '@angular/core';

import { Route } from 'src/app/components/shared/route';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent {
  public static Routes:Route[] = [
    {
      "Route":"Dashboard",
      "Name":"Dashboard",
      "Icon":"house"
    },
    {
      "Route":"Settings",
      "Name":"Settings",
      "Icon":"gear-fill"
    }
  ]

  _Routes = SidebarComponent.Routes;
  SideBarOpen:boolean = false;
  roleLevel:number = -1;

  constructor() {
  }

  ToggleSideBar(){
    this.SideBarOpen = !this.SideBarOpen;
  }
  
}
