import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import {stochasticOscillatorStrategy, stochasticOscillator, Asset, Action} from 'indicatorts';
import { ChartOptions, createChart } from 'lightweight-charts';
import { Subject } from 'rxjs';
import { ChartDataObject, DefaultChartOptions, StrategyData } from 'src/app/components/shared/chartdata';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-strategy-stochastic',
  templateUrl: './strategy-stochastic.component.html',
  styleUrls: ['./strategy-stochastic.component.css']
})
export class StrategyStochasticComponent {
  chartOptions:ChartOptions = DefaultChartOptions;
  @ViewChild("stochasticchart") ChartElement!: ElementRef;

  ChartData: ChartDataObject[] = [];
  @Input() ChartDataSubject!: Subject<ChartDataObject[]>;
  @Input() SignalSubject!: Subject<any[]>;

  Chart: any = null;
  stochasticLineSeries:any = null;
  stochasticLineSeriesSignal:any = null;

  constructor() {
  }

  ngAfterViewInit() {
    this.ChartDataSubject.subscribe((data)=>{
      this.ChartData = data;
      this.updateChartData();
    })

    this.Chart = createChart(this.ChartElement.nativeElement, this.chartOptions);
    this.stochasticLineSeries = this.Chart.addLineSeries({
      color: "cyan",
      title: "",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      crosshairMarkerBackgroundColor: "white",
    });
    this.stochasticLineSeriesSignal = this.Chart.addLineSeries({
      color: "orange",
      title: "stochastic",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      crosshairMarkerBackgroundColor: "white",
    });
  }

  updateChartData(): void {
    var highs = [];
    var lows = [];
    var closes = [];

    for(var i = 0; i < this.ChartData.length;i ++){
      closes.push(this.ChartData[i].close);
      highs.push(this.ChartData[i].high);
      lows.push(this.ChartData[i].low);
    }

    var assetData:Asset = {dates: [], volumes: [], openings: [], highs: [], lows: [], closings: []}
    for(var i = 0; i < this.ChartData.length;i ++){
      assetData.dates.push(new Date(this.ChartData[i].time));
      assetData.volumes.push(1); // no volume data for now
      assetData.openings.push(this.ChartData[i].open);
      assetData.highs.push(this.ChartData[i].high);
      assetData.lows.push(this.ChartData[i].low);
      assetData.closings.push(this.ChartData[i].close);
    }

    var SignalMarkers:StrategyData[] = []
    var stochastictest = stochasticOscillatorStrategy(assetData);

    for(var i = 0; i < stochastictest.length;i ++){
      var action = stochastictest[i];
      if(action == Action.BUY && (SignalMarkers[SignalMarkers.length - 1]?.text != "Buy" || environment.continuosSignals)){
        SignalMarkers.push({time: assetData.dates[i].getTime(), position: "belowBar", color: "green", shape: "arrowUp", text:"Buy", strategy: "stochastic"})
      }
      else if(action == Action.SELL && (SignalMarkers[SignalMarkers.length - 1]?.text != "Sell" || environment.continuosSignals)){
        SignalMarkers.push({time: assetData.dates[i].getTime(), position: "aboveBar", color: "red", shape: "arrowDown", text:"Sell", strategy: "stochastic"})
      }
      else if(action == Action.HOLD && (SignalMarkers[SignalMarkers.length - 1]?.text != "Hold" || environment.continuosSignals)){
        //SignalMarkers.push({time: assetData.dates[i].getTime(), position: "belowBar", color: "gray", shape: "circle", text:"Hold", strategy: "stochastic"})
      }
    }
    var stochasticResult = stochasticOscillator(highs,lows,closes);

    var stochasticLineSeriesData = [];
    var stochasticLineSeriesSignalData = [];
    for(var i = 0; i < stochasticResult.d.length;i ++){
      stochasticLineSeriesData.push({time: this.ChartData[i].time, value: stochasticResult.d[i]})
      stochasticLineSeriesSignalData.push({time: this.ChartData[i].time, value: stochasticResult.k[i]})
    }

    this.stochasticLineSeries.setData(stochasticLineSeriesData);
    this.stochasticLineSeriesSignal.setData(stochasticLineSeriesSignalData);

    this.SignalSubject.next(SignalMarkers);
    
    this.stochasticLineSeries.setMarkers(SignalMarkers);
  }
}
