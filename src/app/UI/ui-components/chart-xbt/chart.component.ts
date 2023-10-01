import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChartOptions, createChart, MismatchDirection } from 'lightweight-charts';
import { ChartService } from 'src/app/Services/chart-service';
import { ChartDataObject, ChartDataVolumeObject, DefaultChartOptions, StrategyData } from 'src/app/components/shared/chartdata';
import { Subject } from "rxjs";
import { sma, backtest, Asset, StrategyInfo, Action, StrategyStats, computeStrategyStats, CompanyResult } from 'indicatorts';
import { SignalCombineService } from 'src/app/Services/signal-combine.service';
import { SharedService } from 'src/app/Services/shared.service';
import { PositionData } from 'src/app/components/shared/orderdata';
import { BitMexService } from 'src/app/Services/bitmex-service';
import { environment } from 'src/environments/environment';
import { NotifierService } from 'angular-notifier';
import { BacktestService } from 'src/app/Services/backtest.service';
import { SettingsService } from 'src/app/Services/settings.service';
import { Settings } from 'src/app/components/settings/settings';

@Component({
  selector: 'app-xbt-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartXBTComponent implements AfterViewInit {
  chartOptions:ChartOptions = DefaultChartOptions;
  @ViewChild("chart") ChartElement!: ElementRef;
  
  Chart: any = null;
  CandleSticksSeries:any = null;
  VolumeSeries:any = null;
  SMASeries:any = null;

  ChartData: ChartDataObject[] = [];

  VolumeData: ChartDataVolumeObject[] = [];

  @Input() ChartDataSubject!: Subject<ChartDataObject[]>;
  @Input() Signals!: Subject<any[]>[];

  SignalsData: StrategyData[] = [];

  PositionData: PositionData[] = [];

  Resolutionstring:string = environment.resolution;
  Resolution:number = 60*24; // TimeFrame. 60 = 1h, 60*24 = 1D
  ResolutionGroup:number = environment.resolutionGroup;

  currentpriceofbitcoin:number = 0;

  Settings?:Settings;

  constructor(
    private chartService: ChartService,
    private CombineService: SignalCombineService,
    private bmexService:BitMexService,
    private notifier:NotifierService,
    private backtestService: BacktestService,
    private settingsService:SettingsService
    ) {

      if(this.Resolutionstring.endsWith("D"))
      {
        var numberValue = parseInt(this.Resolutionstring.replace("D",""));
        this.Resolution = numberValue*60*24;
      }
      else{
        this.Resolution = parseInt(this.Resolutionstring);
      }

      this.bmexService.getPosition().then(data => {
        this.PositionData = data;
      });
    }


  updateSignalsTimer:any = null;

  updateSignals(){
    if (this.updateSignalsTimer !== null) {
      return;
    }
    this.updateSignalsTimer = setTimeout(() => {

    // values i've found for diff timeframes for XBTUSD, i would recommend 12h/1d minimum
    //1D: macd: 0.6726531349452864, stochastic: 0.023239836968729555, acceleration_bands: 0.0781319086508272, bollinger_bands: 0.12826292422259034, projection_oscillator: 0.09890973905581824
    //1H  macd: 0.5414343128487697, stochastic: 0.06645752134209515, acceleration_bands: 0.3291388202065856, bollinger_bands: 0.16920998543153687, projection_oscillator: 0.507146695308129
    //4H  macd: 0.13250845348731477, stochastic: 0.3895107730112096, acceleration_bands: 0.5170090936163697, bollinger_bands: 0.3284579464646433, projection_oscillator: 0.927464334170312
    //12H  macd: 0.9806482964072836, stochastic: 0.04096436580434304, acceleration_bands: 0.17059452945248166, bollinger_bands: 0.15960839194727372, projection_oscillator: 0.09847932192081865

    // ETHUSD :
    // 1D macd: 0.14832254932217392, stochastic: 0.05113434253603899, acceleration_bands: 0.11559234302799382, bollinger_bands: 0.1360943593549424, projection_oscillator: 0.9264391019135609

    var weights1D :Record<string, number> = {
      macd: 0.6726531349452864, stochastic: 0.023239836968729555, acceleration_bands: 0.0781319086508272, bollinger_bands: 0.12826292422259034, projection_oscillator: 0.09890973905581824
    }

    var timestamps = this.SignalsData.map(x => x.time);
    timestamps.sort((a,b) => a - b);    

    /*
    var bestWeights = JSON.parse(JSON.stringify(weights1D));
    var bestResult = -0.005710898276447551; // replace this, and weights above when you get a new best result.

    // somewhat brute force, but it does randomize the values a lot...     
    for(var i = 0; i < 0; i ++){
      
      weights1D["macd"] = Math.random();
      weights1D["stochastic"] = Math.random();
      weights1D["acceleration_bands"] = Math.random();
      weights1D["bollinger_bands"] = Math.random();
      weights1D["projection_oscillator"] = Math.random();
      

      var result = this.CombineService.combineSentiments(this.SignalsData, timestamps, weights1D);
      var backtestAsset:Asset = {dates: [], openings: [], highs: [], lows: [], closings: [], volumes: []};

      result.data.forEach((item) => {
        var closestChartDataItem = this.ChartData.find(x => x.time == item.time);
        if(closestChartDataItem !== undefined){
          backtestAsset.dates.push(new Date(item.time));
          backtestAsset.openings.push(closestChartDataItem.open);
          backtestAsset.highs.push(closestChartDataItem.high);
          backtestAsset.lows.push(closestChartDataItem.low);
          backtestAsset.closings.push(closestChartDataItem.close);
          backtestAsset.volumes.push(1);
        }
      })
  
      var strategyInfos: StrategyInfo[] = [];
  
      strategyInfos.push({name:"combined", strategy: (asset:Asset):Action[]=>{
        var actions:Action[] = [];
        
        result.data.forEach((item) => {
          if(item.text == "Buy"){
            actions.push(Action.BUY)
          } else if(item.text == "Sell"){
            actions.push(Action.SELL)
          }
        })
  
        return actions;
      }})  
  
      var backtestres2 = this.backtestService.backtest(backtestAsset,strategyInfos)

      if(backtestres2[0].gain > bestResult){
        bestResult = JSON.parse(JSON.stringify(backtestres2[0].gain));
        bestWeights = JSON.parse(JSON.stringify(weights1D));
      }
    }

    console.log("best result:", bestResult);
    console.log("best weights:", bestWeights);

    if(bestWeights != null)
    weights1D = bestWeights;
  */    

    var result = this.CombineService.combineSentiments(this.SignalsData, timestamps, weights1D);

    var mostCurrentResult = result.data[result.data.length - 1];

    if(mostCurrentResult != undefined){
      if(mostCurrentResult.time + 60*60*24 > new Date().getTime() / 1000){ // fresh signal
        var btcPosition = this.PositionData.find(x => x.symbol == environment.symbol);

        if(btcPosition != undefined){ // make sure the current position is not the same as signal given. (don't go long / short twice. instead go in the opposite direction.)
          if(btcPosition.currentQty == 0 || (btcPosition.currentQty == environment.initialPosAmount && mostCurrentResult.text == "Sell") || (btcPosition.currentQty == -1*environment.initialPosAmount && mostCurrentResult.text == "Buy")){
           
            if(environment.allowTrading)
              this.bmexService.TryToOpenPosition(mostCurrentResult.text);            
          }
        }
      }
    }

    var markers = JSON.parse(JSON.stringify(result.data));
    markers.push({time: result.currentTime, position: "aboveBar", color: "white", shape: "square", text:"Current_wgt: "+result.currentWeight.toFixed(2) + " required ± "+result.weightRequiredToSwitch.toFixed(2), strategy: "combined"})

    this.CandleSticksSeries.setMarkers(markers);

    var backtestAsset:Asset = {dates: [], openings: [], highs: [], lows: [], closings: [], volumes: []};

    result.data.forEach((item) => {
      var closestChartDataItem = this.ChartData.find(x => x.time == item.time);
      if(closestChartDataItem !== undefined){
        backtestAsset.dates.push(new Date(item.time));
        backtestAsset.openings.push(closestChartDataItem.open);
        backtestAsset.highs.push(closestChartDataItem.high);
        backtestAsset.lows.push(closestChartDataItem.low);
        backtestAsset.closings.push(closestChartDataItem.close);
        backtestAsset.volumes.push(1);
      }
    })

    var strategyInfos: StrategyInfo[] = [];

    strategyInfos.push({name:"combined", strategy: (asset:Asset):Action[]=>{
      var actions:Action[] = [];
      
      result.data.forEach((item) => {
        if(item.text == "Buy"){
          actions.push(Action.BUY)
        } else if(item.text == "Sell"){
          actions.push(Action.SELL)
        }
      })

      return actions;
    }})

    //var backtestresult = backtest(backtestAsset,strategyInfos)
    //console.log("backtest result:", backtestresult[0].gain);

    var backtestres = this.backtestService.backtest(backtestAsset,strategyInfos)

  
    console.log(`(backtest) position size: ${environment.initialPosAmount} contracts | profit or loss => XBT: ${backtestres[0].gain} | USD: ${(backtestres[0].gain)*this.currentpriceofbitcoin}`);

  
    this.updateSignalsTimer = null;
    })
  }

  ngAfterViewInit() {
    this.Chart = createChart(this.ChartElement.nativeElement, this.chartOptions);
    this.CandleSticksSeries = this.Chart.addCandlestickSeries()
    this.VolumeSeries = this.Chart.addHistogramSeries({ color: '#26a69a' });

    if(this.Resolutionstring.endsWith("D") && this.ResolutionGroup != 1){
      this.notifier.notify("error", "Daily candles only support resolution group 1! (ignoring it's value!)");
      this.ResolutionGroup = 1;
    }

    setTimeout(() => {
      SharedService.waitFor(() => this.SignalsData.length > 0, () => { 
        setTimeout(() => {

          this.bmexService.getCurrentPriceOfSymbol().then(data => {
            this.settingsService.Settings.contractMultiplier = data[0].multiplier;
            this.settingsService.SaveSettings();

            this.bmexService.getCurrentPriceOfXBT().then(data => {
              this.currentpriceofbitcoin = data[0].bidPrice
            })
          })
          
          SharedService.waitFor(() => this.currentpriceofbitcoin > 0, () => { 
            this.updateSignals();
          })
       
        }, 1000);
      })
    }, 100);
  

    for(var i = 0; i < this.Signals.length; i++){
      var signal = this.Signals[i];
      signal.subscribe((data)=>{
        data.forEach(item => {
          this.SignalsData.push(item);
        })
      })
    }

    this.SMASeries = this.Chart.addLineSeries({
      color: "white",
      title: "MA 200",
      lineWidth: 1,
      crosshairMarkerVisible: true,
      crosshairMarkerBackgroundColor: "white",
    });

    this.retrieveChart(); 
    var timeScale = this.Chart.timeScale();


    var previousfrom = 0;
    var previousto = 0;

    var timer:any = null;
    timeScale.subscribeVisibleLogicalRangeChange(() => {
      if (timer !== null) {
        return;
      }
      timer = setTimeout(() => {
        var logicalRange = timeScale.getVisibleLogicalRange();
        if (logicalRange !== null) {
          var barsInfo = this.CandleSticksSeries.barsInLogicalRange(logicalRange);
          if (barsInfo !== null && barsInfo.barsBefore < 100) {

            var first = this.CandleSticksSeries.dataByIndex(0, MismatchDirection.NearestLeft);

            var now = SharedService.UTCDATE(new Date(first.time*1000));
            if(this.ResolutionGroup == 1){
              now = new Date(first.time*1000);
            }

            var hours = now.getHours();

            var utcoffset = 0;

            if(this.ResolutionGroup != 1){
              utcoffset = this.groupedHour(hours);
            }

            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);

            const utcMilllisecondsSinceEpoch = now.getTime()
            const toTime = Math.round(utcMilllisecondsSinceEpoch / 1000)

            var to = toTime - (60 * this.Resolution); // multiply by 60 to turn minutes into seconds

            var candlesAgo = (100 * (this.Resolution*60*this.ResolutionGroup)); // 100 candles ago

            if(utcoffset != 0)
            candlesAgo -= utcoffset*3600

            const from = to - candlesAgo + (this.Resolution*60) + 1;
 
            if(to != previousto && from != previousfrom)
            this.getDataAndUpdateExisting(from,to)

            previousto = to;
            previousfrom = from;
          }
        }
      timer = null;
      }, 50);
    });
  }

 
  // if resolutiongroup is 24,the hour must be 0
  // if resolutiongroup is 12, the hour must be 0,12
  // if resolutiongroup is 6, the hour must be 0,6,12,18
  // if resolutiongroup is 4, the hour must be 0,4,8,12,16,20
  // if resolutiongroup is 3, the hour must be 0,3,6,9,12,15,18,21
  // if resolutiongroup is 2, the hour must be 0,2,4,6,8,10,12,14,16,18,20,22

  groupedHour(inputHour:number):number{
    var result = 0;
    var remainder = inputHour % this.ResolutionGroup;

    if(remainder == 0){
      result = inputHour;
    }else{
      result = inputHour - remainder;
    }
    return result;
  }

   retrieveChart(): void {
    var now = SharedService.UTCDATE(new Date());
    if(this.ResolutionGroup == 1){
      now = new Date();
    }
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    var hours = now.getHours();
    var utcoffset = 0;

    if(this.ResolutionGroup != 1){
      utcoffset = this.groupedHour(hours);
    }

    const utcMilllisecondsSinceEpoch = now.getTime()
    const to = Math.round(utcMilllisecondsSinceEpoch / 1000)

    // multiply by 60 to turn minutes into seconds
    var candlesAgo = (100 * (this.Resolution*60*this.ResolutionGroup)); // 100 candles ago
    
    if(utcoffset != 0)
    candlesAgo -= utcoffset*3600

    const from = to - candlesAgo + (this.Resolution*60);
    this.getDataAndUpdate(from,to)
  }

  getDataAndUpdateExisting(from:number, to:number){
    this.chartService.get(this.Resolutionstring,from,to).then((data)=>{
      this.updateChartData(data);
    })
  }

  getDataAndUpdate(from:number, to:number){
    this.chartService.get(this.Resolutionstring,from,to).then((data)=>{
      // use this data for something?
      this.chartService.getCurrentCandle(this.Resolutionstring,to,to).then((result)=>{
        this.updateChartData(result);
      })
    })
  }

  updateChartData(data:ChartDataObject[]): void {
    var newVolumeData: any[] = [];

    for(var i = 0; i < data.length;i ++){

      var VolObject:any = {time:data[i].time, value: data[i].volume};

      if(i == 0){
        if(this.ChartData[0] != undefined && VolObject.value < this.VolumeData[0].value)
        VolObject.color = 'red'
      }else{
        if(VolObject.value < newVolumeData[i-1].value)
        VolObject.color = 'red'
      }

      newVolumeData.push(VolObject)
    }

    this.ChartData = data;

    this.ChartDataSubject.next(this.ChartData);

    const SMAData = sma(200,
      this.ChartData.map((x) => x.close)
    ).map((value:number, index:number) => ({ value, time: this.ChartData[index].time }));

    this.SMASeries.setData(SMAData);

    this.CandleSticksSeries.setData(this.ChartData);

    this.VolumeData = [...newVolumeData, ...this.VolumeData];

    //this.VolumeSeries.setData(this.VolumeData); // bitmex api doesnt return volumes?
  }
}
