import { Component } from '@angular/core';
import { ChartDataObject } from 'src/app/components/shared/chartdata';
import {Subject} from 'rxjs';
import { BitMexService } from 'src/app/Services/bitmex-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  ChartDataSubject: Subject<ChartDataObject[]> = new Subject();

  MacdSignals: Subject<any[]> = new Subject();

  StochasticSignals: Subject<any[]> = new Subject();
  ABSignals: Subject<any[]> = new Subject();
  BBSignals: Subject<any[]> = new Subject();
  POSignals: Subject<any[]> = new Subject();

  /*  these 2 strats work better with 1,3,5 min timeframes
  BBSignals: Subject<any[]> = new Subject();
  POSignals: Subject<any[]> = new Subject();
  */

  Signals: Subject<any[]>[] = [this.MacdSignals, this.StochasticSignals, this.ABSignals, this.BBSignals, this.POSignals];

  constructor( private BMexService: BitMexService) {  
    /* // you should probably show active orders when starting up?
    this.BMexService.getOrders().then(data => {

    })
    */
  }

  

}
