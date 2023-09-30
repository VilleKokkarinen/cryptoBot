import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Asset, accelerationBands, Action, accelerationBandsStrategy } from 'indicatorts';
import { ChartOptions, createChart } from 'lightweight-charts';
import { Subject } from 'rxjs';
import { DefaultChartOptions, ChartDataObject, StrategyData } from 'src/app/components/shared/chartdata';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-strategy-acceleration-bands',
  templateUrl: './strategy-acceleration-bands.component.html',
  styleUrls: ['./strategy-acceleration-bands.component.css']
})
export class StrategyAccelerationBandsComponent {
  chartOptions:ChartOptions = DefaultChartOptions;
  @ViewChild("abchart") ChartElement!: ElementRef;

  ChartData: ChartDataObject[] = [];
  @Input() ChartDataSubject!: Subject<ChartDataObject[]>;
  @Input() SignalSubject!: Subject<any[]>;

  Chart: any = null;
  abLineSeriesLowerBand:any = null;
  abLineSeriesMiddleBand:any = null;
  abLineSeriesUpperBand:any = null;

  constructor() {
  }

  ngAfterViewInit() {
    this.ChartDataSubject.subscribe((data)=>{
      this.ChartData = data;
      this.updateChartData();
    })

    this.Chart = createChart(this.ChartElement.nativeElement, this.chartOptions);
    this.abLineSeriesLowerBand = this.Chart.addLineSeries({
      color: "cyan",
      title: "",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      crosshairMarkerBackgroundColor: "white",
    });
    this.abLineSeriesMiddleBand = this.Chart.addLineSeries({
      color: "white",
      title: "",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      crosshairMarkerBackgroundColor: "white",
    });
    this.abLineSeriesUpperBand = this.Chart.addLineSeries({
      color: "orange",
      title: "ab",
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
    var abtest = accelerationBandsStrategy(assetData);

    for(var i = 0; i < abtest.length;i ++){
      var action = abtest[i];
      if(action == Action.BUY && (SignalMarkers[SignalMarkers.length - 1]?.text != "Buy" || environment.continuosSignals)){
        SignalMarkers.push({time: assetData.dates[i].getTime(), position: "belowBar", color: "green", shape: "arrowUp", text:"Buy", strategy: "acceleration_bands"})
      }
      else if(action == Action.SELL && (SignalMarkers[SignalMarkers.length - 1]?.text != "Sell" || environment.continuosSignals)){ 
        SignalMarkers.push({time: assetData.dates[i].getTime(), position: "aboveBar", color: "red", shape: "arrowDown", text:"Sell", strategy: "acceleration_bands"})
      }
      else if(action == Action.HOLD && (SignalMarkers[SignalMarkers.length - 1]?.text != "Hold" || environment.continuosSignals)){
        //SignalMarkers.push({time: assetData.dates[i].getTime(), position: "belowBar", color: "gray", shape: "circle", text:"Hold", strategy: "acceleration_bands"})
      }
    }
    var abResult = accelerationBands(assetData.highs, assetData.lows, assetData.closings);
    
    var abLineSeriesLowerBandData = [];
    var abLineSeriesMidBandData = [];
    var abLineSeriesUpperBandData = [];

    for(var i = 0; i < abResult.lowerBand.length;i ++){
      abLineSeriesLowerBandData.push({time: this.ChartData[i].time, value: abResult.lowerBand[i]})
      abLineSeriesMidBandData.push({time: this.ChartData[i].time, value: abResult.middleBand[i]})
      abLineSeriesUpperBandData.push({time: this.ChartData[i].time, value: abResult.upperBand[i]})
    }

    this.abLineSeriesLowerBand.setData(abLineSeriesLowerBandData);
    this.abLineSeriesMiddleBand.setData(abLineSeriesMidBandData);
    this.abLineSeriesUpperBand.setData(abLineSeriesUpperBandData);

    this.SignalSubject.next(SignalMarkers);
    
    this.abLineSeriesLowerBand.setMarkers(SignalMarkers);
  }
}
