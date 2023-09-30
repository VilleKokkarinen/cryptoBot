import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import {macdStrategy, macd, MacdResult, Asset, Action} from 'indicatorts';
import { ChartOptions, createChart } from 'lightweight-charts';
import { Subject } from 'rxjs';
import { ChartDataObject, DefaultChartOptions, StrategyData } from 'src/app/components/shared/chartdata';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-strategy-macd',
  templateUrl: './strategy-macd.component.html',
  styleUrls: ['./strategy-macd.component.css']
})
export class StrategyMacdComponent {
  chartOptions:ChartOptions = DefaultChartOptions;
  @ViewChild("macdchart") ChartElement!: ElementRef;

  ChartData: ChartDataObject[] = [];
  @Input() ChartDataSubject!: Subject<ChartDataObject[]>;
  @Input() SignalSubject!: Subject<any[]>;

  Chart: any = null;
  MACDLineSeries:any = null;
  MACDLineSeriesSignal:any = null;

  constructor() {
  }

  ngAfterViewInit() {
    this.ChartDataSubject.subscribe((data)=>{
      this.ChartData = data;
      this.updateChartData();
    })

    this.Chart = createChart(this.ChartElement.nativeElement, this.chartOptions);
    this.MACDLineSeries = this.Chart.addLineSeries({
      color: "cyan",
      title: "",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      crosshairMarkerBackgroundColor: "white",
    });
    this.MACDLineSeriesSignal = this.Chart.addLineSeries({
      color: "orange",
      title: "macd",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      crosshairMarkerBackgroundColor: "white",
    });
  }

  updateChartData(): void {
    var rsidata = [];
    for(var i = 0; i < this.ChartData.length;i ++){
      rsidata.push(this.ChartData[i].close);
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
    var macdtest = macdStrategy(assetData);

    for(var i = 0; i < macdtest.length;i ++){
      var action = macdtest[i];
      if(action == Action.BUY && (SignalMarkers[SignalMarkers.length - 1]?.text != "Buy" || environment.continuosSignals)){
        SignalMarkers.push({time: assetData.dates[i].getTime(), position: "belowBar", color: "green", shape: "arrowUp", text:"Buy", strategy: "macd"})
      }
      else if(action == Action.SELL && (SignalMarkers[SignalMarkers.length - 1]?.text != "Sell" || environment.continuosSignals)){
        SignalMarkers.push({time: assetData.dates[i].getTime(), position: "aboveBar", color: "red", shape: "arrowDown", text:"Sell", strategy: "macd"})
      }
      else if(action == Action.HOLD && (SignalMarkers[SignalMarkers.length - 1]?.text != "Hold" || environment.continuosSignals)){
        //SignalMarkers.push({time: assetData.dates[i].getTime(), position: "belowBar", color: "gray", shape: "circle", text:"Hold", strategy: "macd"})
      }
    }
    var macdResult = macd(rsidata);

    var MACDLineSeriesData = [];
    var MACDLineSeriesSignalData = [];
    for(var i = 0; i <  macdResult.macdLine.length;i ++){
      MACDLineSeriesData.push({time: this.ChartData[i].time, value: macdResult.macdLine[i]})
      MACDLineSeriesSignalData.push({time: this.ChartData[i].time, value: macdResult.signalLine[i]})
    }

    this.MACDLineSeries.setData(MACDLineSeriesData);
    this.MACDLineSeriesSignal.setData(MACDLineSeriesSignalData);

    this.SignalSubject.next(SignalMarkers);
    
    this.MACDLineSeries.setMarkers(SignalMarkers);
  }
}
