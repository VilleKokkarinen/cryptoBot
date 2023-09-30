import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Asset, bollingerBandsStrategy, Action, bollingerBands } from 'indicatorts';
import { ChartOptions, createChart } from 'lightweight-charts';
import { Subject } from 'rxjs';
import { DefaultChartOptions, ChartDataObject, StrategyData } from 'src/app/components/shared/chartdata';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-strategy-bollinger-bands',
  templateUrl: './strategy-bollinger-bands.component.html',
  styleUrls: ['./strategy-bollinger-bands.component.css']
})
export class StrategyBollingerBandsComponent {
  chartOptions:ChartOptions = DefaultChartOptions;
  @ViewChild("bbchart") ChartElement!: ElementRef;

  ChartData: ChartDataObject[] = [];
  @Input() ChartDataSubject!: Subject<ChartDataObject[]>;
  @Input() SignalSubject!: Subject<any[]>;

  Chart: any = null;
  bbLineSeriesLowerBand:any = null;
  bbLineSeriesMiddleBand:any = null;
  bbLineSeriesUpperBand:any = null;

  constructor() {
  }

  ngAfterViewInit() {
    this.ChartDataSubject.subscribe((data)=>{
      this.ChartData = data;
      this.updateChartData();
    })

    this.Chart = createChart(this.ChartElement.nativeElement, this.chartOptions);
    this.bbLineSeriesLowerBand = this.Chart.addLineSeries({
      color: "cyan",
      title: "",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      crosshairMarkerBackgroundColor: "white",
    });
    this.bbLineSeriesMiddleBand = this.Chart.addLineSeries({
      color: "white",
      title: "",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      crosshairMarkerBackgroundColor: "white",
    });
    this.bbLineSeriesUpperBand = this.Chart.addLineSeries({
      color: "orange",
      title: "bb",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      crosshairMarkerBackgroundColor: "white",
    });
  }

  updateChartData(): void {
    var data = [];
    for(var i = 0; i < this.ChartData.length;i ++){
      data.push(this.ChartData[i].close);
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
    var bbtest = bollingerBandsStrategy(assetData);

    for(var i = 0; i < bbtest.length;i ++){
      var action = bbtest[i];
      if(action == Action.BUY && (SignalMarkers[SignalMarkers.length - 1]?.text != "Buy" || environment.continuosSignals)){
        SignalMarkers.push({time: assetData.dates[i].getTime(), position: "belowBar", color: "green", shape: "arrowUp", text:"Buy", strategy: "bollinger_bands"})
      }
      else if(action == Action.SELL && (SignalMarkers[SignalMarkers.length - 1]?.text != "Sell" ||environment.continuosSignals)){
        SignalMarkers.push({time: assetData.dates[i].getTime(), position: "aboveBar", color: "red", shape: "arrowDown", text:"Sell", strategy: "bollinger_bands"})
      }
      else if(action == Action.HOLD && (SignalMarkers[SignalMarkers.length - 1]?.text != "Hold" || environment.continuosSignals)){
        //SignalMarkers.push({time: assetData.dates[i].getTime(), position: "belowBar", color: "gray", shape: "circle", text:"Hold", strategy: "bollinger bands"})
      }
    }
    var bbResult = bollingerBands(data);
    
    var bbLineSeriesLowerBandData = [];
    var bbLineSeriesMidBandData = [];
    var bbLineSeriesUpperBandData = [];

    for(var i = 0; i < bbResult.lowerBand.length;i ++){
      bbLineSeriesLowerBandData.push({time: this.ChartData[i].time, value: bbResult.lowerBand[i]})
      bbLineSeriesMidBandData.push({time: this.ChartData[i].time, value: bbResult.middleBand[i]})
      bbLineSeriesUpperBandData.push({time: this.ChartData[i].time, value: bbResult.upperBand[i]})
    }

    this.bbLineSeriesLowerBand.setData(bbLineSeriesLowerBandData);
    this.bbLineSeriesMiddleBand.setData(bbLineSeriesMidBandData);
    this.bbLineSeriesUpperBand.setData(bbLineSeriesUpperBandData);

    this.SignalSubject.next(SignalMarkers);
    
    this.bbLineSeriesLowerBand.setMarkers(SignalMarkers);
  }
}
