import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './UI/ui-components/main/main.component';
import { ErrorComponent } from './UI/ui-components/error/error.component';
import { DashboardComponent } from './Routes/dashboard/dashboard.component';
import { SettingsComponent } from './Routes/settings/settings.component';

const routes: Routes =[
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'Dashboard',
        pathMatch: 'full'
      },
      {
        path: 'Dashboard',
        component: DashboardComponent
      },
      {
        path: 'Settings',
        component: SettingsComponent
      }
    ]
  },
  {
    path: 'Error',
    component: ErrorComponent
  },
  {
    path: '**',
    redirectTo: 'Dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
