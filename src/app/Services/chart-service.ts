import { EventEmitter, Injectable, Output } from '@angular/core';
import { LoadingSpinnerService } from './loading-spinner.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartData, ChartDataObject } from '../components/shared/chartdata';
import { environment } from 'src/environments/environment';
import { NotifierService } from 'angular-notifier';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  Cache: ChartDataObject[] = [];
  Symbol:string = environment.symbol;
  Resolution:string = environment.resolution;
  ResolutionGroup:number = environment.resolutionGroup;

  @Output() CacheChange = new EventEmitter<ChartDataObject[]>()
  
  constructor(private loader: LoadingSpinnerService, private http:HttpClient, private notifier:NotifierService) { 
    if(this.Resolution.endsWith("D") && this.ResolutionGroup != 1){
      this.notifier.notify("error", "Daily candles only support resolution group 1! (ignoring it's value!)");
      this.ResolutionGroup = 1;
    }
  }

  url:string = "/proxy";

  get(resolution:string=this.Resolution, from:number, to:number): Promise<ChartDataObject[]> {

    if(this.Cache.length == 0)
    this.LoadCache();

    this.loader.addRequest();

    console.log("retrieved x cached candles:", this.Cache.length)

    return new Promise((resolve) => {
      if(this.Cache.length == 0 || to < this.Cache[0].time){ // cache needs more candles into the past
        this.http.get<ChartData>(`${this.url}udf/history?symbol=${this.Symbol}&resolution=${resolution}&from=${from}&to=${to}`).subscribe(data => {
          //this.removeEarlyData(data,from);
          this.updateChartData(data)
          this.SaveCache();
          this.loader.reduceRequest();
          resolve(this.Cache)
        },(err)=>{
          console.log(err)
          this.loader.reduceRequest();
        })
      }else if (this.Cache.length == 0 || to > this.Cache[this.Cache.length-1].time){ // cache needs more candles into the future
        this.http.get<ChartData>(`${this.url}udf/history?symbol=${this.Symbol}&resolution=${resolution}&from=${from}&to=${to}`).subscribe(data => {
          //this.removeEarlyData(data,from);
          this.updateChartDataReverse(data)
          this.SaveCache();
          this.loader.reduceRequest();
          resolve(this.Cache)
        },(err)=>{
          console.log(err)
          this.loader.reduceRequest();
        })
      }
      else{
        this.loader.reduceRequest();
        resolve(this.Cache)
      }
    })
  }

  getCurrentCandle(resolution:string=this.Resolution, from:number, to:number): Promise<ChartDataObject[]> {
    if(this.Cache.length == 0)
    this.LoadCache();

    this.loader.addRequest();

    return new Promise((resolve) => { // the most recent candle can be specced to different resolution, here it's the hourly since i used dailys
      this.http.get<ChartData>(`${this.url}udf/history?symbol=${this.Symbol}&resolution=${resolution}&from=${from}&to=${to}`).subscribe(data => {
        this.updateMostRecentCandle(data)
        this.SaveCache();
        this.loader.reduceRequest();
        resolve(this.Cache)
      },(err)=>{
        console.log(err)
        this.loader.reduceRequest();
      })
    })
  }

  removeEarlyData(data:ChartData,from:number){
    if(data.t.length == 0)
      return;

    if(data.t[0] >= from)
      return;
    else{
      data.t.splice(0,1);
      data.o.splice(0,1);
      data.h.splice(0,1);
      data.l.splice(0,1);
      data.c.splice(0,1);
      data.v.splice(0,1);
      this.removeEarlyData(data,from);
    }
  }

  groupChartData(data:ChartData):ChartData{
    if(this.ResolutionGroup == 1)
      return data;
    else{
      var result:ChartData = {t:[], o:[], h:[], l:[], c:[], v:[]};

      var currentCandle = {t:0, o:0, h:0, l:0, c:0, v:0};

      var candlesHandled = 1;
      for(var i = 0; i < data.t.length;i ++){

        var candle = {t:data.t[i], o:data.o[i], h:data.h[i], l:data.l[i], c:data.c[i], v:data.v[i]};

        if(candlesHandled == 1){
          currentCandle.t = candle.t;
          currentCandle.o = candle.o;
          currentCandle.h = candle.h;
          currentCandle.l = candle.l;
          currentCandle.c = candle.c;
          currentCandle.v = candle.v;
        }else{
          if(candle.h > currentCandle.h)
            currentCandle.h = candle.h;
          if(candle.l < currentCandle.l)
            currentCandle.l = candle.l;
          currentCandle.c = candle.c;
          currentCandle.v += candle.v;
        }

        if(candlesHandled == this.ResolutionGroup || i == data.t.length-2){
          candlesHandled = 1;
          result.t.push(JSON.parse(JSON.stringify(currentCandle.t)));
          result.o.push(JSON.parse(JSON.stringify(currentCandle.o)));
          result.h.push(JSON.parse(JSON.stringify(currentCandle.h)));
          result.l.push(JSON.parse(JSON.stringify(currentCandle.l)));
          result.c.push(JSON.parse(JSON.stringify(currentCandle.c)));
          result.v.push(JSON.parse(JSON.stringify(currentCandle.v)));
          currentCandle = {t:0, o:0, h:0, l:0, c:0, v:0};
        }else{
          candlesHandled++;
        }
      }

      return result;
    }
  }

  updateChartData(data:ChartData): void {

    data = this.groupChartData(data);

    var newChartData: any[] = [];

    for(var i = 0; i < data.t.length;i ++){
      var validCandle = true;

      if(this.Cache.length > 0){
        if(data.t[i] >= this.Cache[0].time)
        validCandle = false;
      }

      if(validCandle){
        var object = {time:data.t[i], open: data.o[i], high: data.h[i], low: data.l[i], close: data.c[i]}
        newChartData.push(object)
      }
    }

    this.Cache = [...newChartData, ...this.Cache];
  }

  updateChartDataReverse(data:ChartData): void {
    data = this.groupChartData(data);
    for(var i = 0; i < data.t.length-1;i ++){ // length -1 because the last candle is the current one, which is not finished yet and falsifies data
      var validCandle = true;
      if(this.Cache.length > 0){
        if(data.t[i] <= this.Cache[this.Cache.length-1].time)
        validCandle = false;
      }

      if(validCandle){
        var object: ChartDataObject = {time:data.t[i], open: data.o[i], high: data.h[i], low: data.l[i], close: data.c[i], volume: data.v[i]}
        this.Cache.push(object)
      }
    }
  }

  updateMostRecentCandle(data:ChartData): void {
    var validData = data;
    if(data.t.length > 1){ // why more than 1 candle?, just take the most recent one
      validData = {t:[data.t[data.t.length-1]], o:[data.o[data.o.length-1]], h:[data.h[data.h.length-1]], l:[data.l[data.l.length-1]], c:[data.c[data.c.length-1]], v:[data.v[data.v.length-1]]}
    }

    for(var i = 0; i < validData.t.length;i ++){
      var cacheAlreadyHasThisCandle = false;
      if(this.Cache.length > 0){
        if(validData.t[i] == this.Cache[this.Cache.length-1].time)
        cacheAlreadyHasThisCandle = true;
      }

      if(cacheAlreadyHasThisCandle){
        var object: ChartDataObject = {time:validData.t[i], open: this.Cache[this.Cache.length-1].close, high: validData.h[i], low: validData.l[i], close: validData.c[i], volume: validData.v[i]}
        this.Cache[this.Cache.length-1] = object
      }else{
        var object: ChartDataObject = {time:validData.t[i], open: this.Cache[this.Cache.length-1].close, high: validData.h[i], low: validData.l[i], close: validData.c[i], volume: validData.v[i]}
        this.Cache.push(object)
      }
    }
  }

  // resolution is minutes. so 60 = 1h, and if you want >= dailys it must be 1D etc...
  LoadCache(){
    var Existing = null;

    Existing = JSON.parse(localStorage.getItem(`${this.Symbol}_cache_${this.Resolution}_${this.ResolutionGroup}`)!);

    if(Existing == undefined || Existing == null){
      Existing = this.GetDefaultCache();
      this.Cache = Existing;
      this.SaveCache();
      //console.log("Reset Cache to default, no Cache saved in local storage.")
    }else{
      //console.log("Loaded Cache from localstorage: ", Existing)
    }

    if((Existing as Array<ChartDataObject>).length > 0){
      Existing.splice(Existing.length-1,1) // always discard the most recent candle as it was saved before it was finished (eg. daily candle will close at 24, so the next day when you start up it's invalid)
    }

    this.Cache = Existing;
    this.CacheChange.emit(this.Cache);
  }

  GetDefaultCache(){
    return [];
  }

  SaveCache(){
    localStorage.setItem(`${this.Symbol}_cache_${this.Resolution}_${this.ResolutionGroup}`, JSON.stringify(this.Cache));
    this.CacheChange.emit(this.Cache);
  }


  ResetCache() {
    localStorage.removeItem(`${this.Symbol}_cache_${this.Resolution}_${this.ResolutionGroup}`);
    this.Cache=this.GetDefaultCache();
    this.SaveCache();
  }
}