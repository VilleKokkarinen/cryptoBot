import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Asset, Action, projectionOscillator, projectionOscillatorStrategy } from 'indicatorts';
import { ChartOptions, createChart } from 'lightweight-charts';
import { Subject } from 'rxjs';
import { DefaultChartOptions, ChartDataObject, StrategyData } from 'src/app/components/shared/chartdata';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-strategy-projection-oscillator',
  templateUrl: './strategy-projection-oscillator.component.html',
  styleUrls: ['./strategy-projection-oscillator.component.css']
})
export class StrategyProjectionOscillatorComponent {
  chartOptions:ChartOptions = DefaultChartOptions;
  @ViewChild("pochart") ChartElement!: ElementRef;

  ChartData: ChartDataObject[] = [];
  @Input() ChartDataSubject!: Subject<ChartDataObject[]>;
  @Input() SignalSubject!: Subject<any[]>;

  Chart: any = null;
  poLineSeries:any = null;
  poLineSeriesSignal:any = null;

  constructor() {
  }

  ngAfterViewInit() {
    this.ChartDataSubject.subscribe((data)=>{
      this.ChartData = data;
      this.updateChartData();
    })

    this.Chart = createChart(this.ChartElement.nativeElement, this.chartOptions);
    this.poLineSeries = this.Chart.addLineSeries({
      color: "cyan",
      title: "",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      crosshairMarkerBackgroundColor: "white",
    });
    this.poLineSeriesSignal = this.Chart.addLineSeries({
      color: "orange",
      title: "po",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      crosshairMarkerBackgroundColor: "white",
    });
  }

  updateChartData(): void {
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
    var potest = projectionOscillatorStrategy(assetData);

    for(var i = 0; i < potest.length;i ++){
      var action = potest[i];
      if(action == Action.BUY && (SignalMarkers[SignalMarkers.length - 1]?.text != "Buy" || environment.continuosSignals)){
        SignalMarkers.push({time: assetData.dates[i].getTime(), position: "belowBar", color: "green", shape: "arrowUp", text:"Buy", strategy: "projection_oscillator"})
      }
      else if(action == Action.SELL && (SignalMarkers[SignalMarkers.length - 1]?.text != "Sell" || environment.continuosSignals)){
        SignalMarkers.push({time: assetData.dates[i].getTime(), position: "aboveBar", color: "red", shape: "arrowDown", text:"Sell", strategy: "projection_oscillator"})
      }
      else if(action == Action.HOLD && (SignalMarkers[SignalMarkers.length - 1]?.text != "Hold" || environment.continuosSignals)){
        //SignalMarkers.push({time: assetData.dates[i].getTime(), position: "belowBar", color: "gray", shape: "circle", text:"Hold", strategy: "po"})
      }
    }
    var poResult = projectionOscillator(28,7,assetData.highs,assetData.lows,assetData.closings);

    var poLineSeriesData = [];
    var poLineSeriesSignalData = [];
    for(var i = 0; i < poResult.po.length;i ++){
      poLineSeriesData.push({time: this.ChartData[i].time, value: poResult.po[i]})
      poLineSeriesSignalData.push({time: this.ChartData[i].time, value: poResult.spo[i]})
    }

    this.poLineSeries.setData(poLineSeriesData);
    this.poLineSeriesSignal.setData(poLineSeriesSignalData);

    this.SignalSubject.next(SignalMarkers);
    
    this.poLineSeries.setMarkers(SignalMarkers);
  }
}
