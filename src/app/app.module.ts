/* core modules */
import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';

/* ui components */
import { HeaderComponent } from './UI/ui-components/header/header.component';
import { FooterComponent } from './UI/ui-components/footer/footer.component';
import { ErrorComponent } from './UI/ui-components/error/error.component';
import { SmallLoadingSpinner } from './UI/ui-components/loading-spinner/small-spinner/small-spinner.component';
import { FullScreenSpinnerComponent } from './UI/ui-components/loading-spinner/full-screen-spinner/full-screen-spinner.component';
import { SidebarComponent } from './UI/ui-components/sidebar/sidebar.component';

/* route components */
import { DashboardComponent } from './Routes/dashboard/dashboard.component';

import { RouteDropdownComponent } from './UI/ui-components/header/route-dropdown/route-dropdown.component';
import { ReactiveFormsModule } from "@angular/forms";

import { MainComponent } from './UI/ui-components/main/main.component';

import { SettingsComponent } from './Routes/settings/settings.component';
import { NotifierModule } from 'angular-notifier';
import { ChartXBTComponent } from './UI/ui-components/chart-xbt/chart.component';
import { ChartRSIComponent } from './UI/ui-components/chart-rsi/chart.component';
import { StrategyMacdComponent } from './UI/ui-components/strategy-macd/strategy-macd.component';
import { StrategyBollingerBandsComponent } from './UI/ui-components/strategy-bollinger-bands/strategy-bollinger-bands.component';
import { StrategyStochasticComponent } from './UI/ui-components/strategy-stochastic/strategy-stochastic.component';
import { StrategyAccelerationBandsComponent } from './UI/ui-components/strategy-acceleration-bands/strategy-acceleration-bands.component';
import { StrategyProjectionOscillatorComponent } from './UI/ui-components/strategy-projection-oscillator/strategy-projection-oscillator.component';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    ErrorComponent,
    SmallLoadingSpinner,
    FullScreenSpinnerComponent,
    SidebarComponent,
    DashboardComponent,
    RouteDropdownComponent,
    MainComponent,
    SettingsComponent,
    ChartXBTComponent,
    ChartRSIComponent,
    StrategyMacdComponent,
    StrategyBollingerBandsComponent,
    StrategyStochasticComponent,
    StrategyAccelerationBandsComponent,
    StrategyProjectionOscillatorComponent
  ],
  imports: [
    NotifierModule.withConfig({
      position:{
        horizontal:{
          position:"right",
          distance:130
        },
        vertical:{
          position:"top",
          distance:3
        }
      },
      behaviour: {
        autoHide: 4000
      }
    }),
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [],
  providers: [
    { provide: LOCALE_ID, useValue: 'en-US' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
