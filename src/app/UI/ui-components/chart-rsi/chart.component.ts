import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChartOptions, createChart } from 'lightweight-charts';
import { ChartDataObject, DefaultChartOptions } from 'src/app/components/shared/chartdata';
import { customRsi } from 'indicatorts';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-rsi-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartRSIComponent {
  chartOptions:ChartOptions = DefaultChartOptions;

  @ViewChild("rsichart") ChartElement!: ElementRef;

  ChartData: ChartDataObject[] = [];
  @Input() ChartDataSubject!: Subject<ChartDataObject[]>;

  Chart: any = null;
  RSISeries:any = null;
 

  constructor() {
  }

  ngAfterViewInit() {
    this.ChartDataSubject.subscribe((data)=>{
      this.ChartData = data;
      this.updateChartData();
    })

    this.Chart = createChart(this.ChartElement.nativeElement, this.chartOptions);
    this.RSISeries = this.Chart.addLineSeries({
      color: "red",
      title: "RSI",
      lineWidth: 1,
      crosshairMarkerVisible: true,
      crosshairMarkerBackgroundColor: "white",
    });


    const RSI70Line = {
      price: 70,
      color: 'white',
      lineWidth: 1,
      lineStyle: 2, // LineStyle.Dashed
      axisLabelVisible: false,
      title: '',
    };

    const RSI30Line = {
      price: 30,
      color: 'white',
      lineWidth: 1,
      lineStyle: 2, // LineStyle.Dashed
      axisLabelVisible: false,
      title: '',
    };
  
  this.RSISeries.createPriceLine(RSI70Line);
  this.RSISeries.createPriceLine(RSI30Line);
  }

  updateChartData(): void {
    var rsidata = [];
    for(var i = 0; i < this.ChartData.length;i ++){
      rsidata.push(this.ChartData[i].close);
    }

    var rsidataresult:any[] = customRsi(14, rsidata);

    var resultingData = [];
    for(var i = 0; i < rsidataresult.length;i ++){
      resultingData.push({time: this.ChartData[i].time, value: rsidataresult[i]})
    }

    this.RSISeries.setData(resultingData);
  }
}
