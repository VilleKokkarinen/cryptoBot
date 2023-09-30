import { EventEmitter, Injectable, Output } from '@angular/core';
import { LoadingSpinnerService } from './loading-spinner.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartDataObject } from '../components/shared/chartdata';
import { InstrumentData, OrderData, PositionData } from '../components/shared/orderdata';
import { HmacSHA256 } from 'crypto-js';
import { SharedService } from './shared.service';
import { environment } from 'src/environments/environment';
import { NotifierService } from 'angular-notifier';

@Injectable({
  providedIn: 'root',
})
export class BitMexService {
  Cache: ChartDataObject[] = [];
 
  Apikey: string = environment.apikey;
  ApiSecret: string = environment.apisec;
  Symbol: string = environment.symbol;
  TradeAmount:number = environment.initialPosAmount;

  @Output() CacheChange = new EventEmitter<ChartDataObject[]>()
  itemservice: any;
  
  FaultyState = false; // somethings gone wrong. dont allow buying / selling, only canceling orders

  constructor(private loader: LoadingSpinnerService, private http:HttpClient, private notifier:NotifierService) { 
  }

  url:string = "/proxy";

  toHex(value:any) {
    let hex = value.toString(16);
    if ((hex.length % 2) > 0) {
        hex = "0" + hex;
    }
    return hex;
  }

  GenerateSignature(expires:string, verb:string, path:string, data:string=''){
    var combined = verb + path + expires + data;
    const signature = this.toHex(HmacSHA256(combined, this.ApiSecret).toString());
    return signature;
  }

  GenerateHeaders(verb:string, path:string, data:string = ""):HttpHeaders{
    var headers = new HttpHeaders();

    var now = Math.round(new Date().getTime() / 1000) + 60 * 5 // 5 min in the future

    var timestamp = now.toString();

    headers = headers.append('api-expires', timestamp);
    headers = headers.append('api-key', this.Apikey)
    headers = headers.append('content-type', 'application/json')
    headers = headers.append('Accept', 'application/json')
    headers = headers.append('X-Requested-With', 'XMLHttpRequest/json')
    headers = headers.append('api-signature', this.GenerateSignature(timestamp, verb, path, data));
    return headers;
  }

  // returns currently active orders
  getOrders(): Promise<OrderData[]> {
    this.loader.addRequest();
    var relativePath = `v1/order?symbol=${this.Symbol}&filter=%7B%22open%22%3A%20true%7D&count=100&reverse=false`
    var totalUrl = `${this.url}${relativePath}`

    var fullurl = `/api/${relativePath}`
    let options = {headers: this.GenerateHeaders("GET", fullurl)}

    return new Promise((resolve) => {
      this.http.get<OrderData[]>(totalUrl, options).subscribe(data => {
        this.notifier.notify("success", "Successfully got orders from Bitmex")
        this.loader.reduceRequest();
        resolve(data)
      },(err)=>{
        this.notifier.notify("error", "Error getting orders from Bitmex (Check environment.ts apikey and apisec)")
        console.log(err)
        this.loader.reduceRequest();
      })
    })
  }

   // returns currently active position
   getPosition(): Promise<PositionData[]> {
    this.loader.addRequest();
    var relativePath = `v1/position?filter=%7B%22symbol%22%3A%20%22${this.Symbol}%22%7D`
    var totalUrl = `${this.url}${relativePath}`

    var fullurl = `/api/${relativePath}`
    let options = {headers: this.GenerateHeaders("GET", fullurl)}

    return new Promise((resolve) => {
      this.http.get<PositionData[]>(totalUrl, options).subscribe(data => {
        this.loader.reduceRequest();
        this.notifier.notify("success", "Successfully got position from Bitmex")
        resolve(data)
      },(err)=>{
        this.notifier.notify("error", "Error getting position from Bitmex (Check environment.ts apikey and apisec)")
        console.log(err)
        this.loader.reduceRequest();
        resolve([])
      })
    })
  }

  getCurrentPriceOfBicoin(): Promise<InstrumentData[]> {
    this.loader.addRequest();
    var relativePath = `v1/instrument?symbol=${this.Symbol}&count=100&reverse=false`
    var totalUrl = `${this.url}${relativePath}`

    var fullurl = `/api/${relativePath}`
    let options = {headers: this.GenerateHeaders("GET", fullurl)}

    return new Promise((resolve) => {
      this.http.get<InstrumentData[]>(totalUrl, options).subscribe(data => {
        this.loader.reduceRequest();
        this.notifier.notify("success", "Successfully got current price of Bitcoin from Bitmex")
        resolve(data)
      },(err)=>{
        this.notifier.notify("error", "Error getting current price from Bitmex (Check environment.ts apikey and apisec)")
        console.log(err)
        this.loader.reduceRequest();
      })
    })
  }

  CheckIfOrderFilled():boolean{
    var response = false;
    this.getOrders().then((data) => {
      if(data.length == 0)
      {
        response = true
      }
      else if (data.length == 1)
      {
        if(data[0].ordStatus == "Filled")
        {
          response = true
        }
      }
    })
    return response;
  }

  CancelAllOrders(data: OrderData[]):boolean{
     this.deleteOrders(data.map((x) => x.orderID)).then(() => {
      return true;
    }, (err) => { 
      console.log(err); return false; 
    })
    return false;
  }

  // call this if something goes horribly wrong?
  CancelAllPositions(data: PositionData[]):boolean{
    var allsuccess = true;
    data.forEach(pos => {
      this.cancelPosition(pos).then(data => {

      })
    })
   return allsuccess;
  }

   // cancels (deletes) order(s) by id
   cancelPosition(Position:PositionData): Promise<OrderData[]> {
    this.loader.addRequest();
    return new Promise((resolve) => {

    if(Position.currentQty == 0){
      // no open position
      resolve([]);
      this.loader.reduceRequest();
    }

    var relativePath = `v1/order?symbol=${Position.symbol}&orderQty=${Position.currentQty*-1}&ordType=Market`
    var totalUrl = `${this.url}${relativePath}`

    var fullurl = `/api/${relativePath}`
    let options = {headers: this.GenerateHeaders("POST", fullurl)}
      this.http.post<OrderData[]>(totalUrl, options).subscribe(data => {
        this.loader.reduceRequest();
        this.notifier.notify("success", "Successfully cancelled position from Bitmex")
        resolve(data)
      },(err)=>{
        this.notifier.notify("error", "Error cancelling position from Bitmex (Check environment.ts apikey and apisec)")
        console.log(err)
        this.loader.reduceRequest();
      })
    })
  }

  OpenPositionPreCheck():string{
    var response = "error";
    var positions:PositionData[]|null = null;
    var orders:OrderData[]|null = null;

    this.getPosition().then((currentPosition)=>{
      positions = currentPosition;
    });

    this.getOrders().then((currentOrders)=>{
      orders = currentOrders;
    });

    SharedService.waitFor(() => positions !== null && orders !== null, () => {
      if(orders !== null && orders?.length > 0){ // why is there open orders???
        this.CancelAllOrders(orders);
      }

      if(positions !== null && positions?.length >= 1){
        var position = positions.find(x => x.symbol == this.Symbol);

        if(position !== undefined){
          if(position.currentQty >= 2*this.TradeAmount || position.currentQty <= -2*this.TradeAmount ){
            this.cancelPosition(position).then((data)=>{
              response = "cancelled";
            },()=>{response = "error"})
          }else if(position.currentQty == this.TradeAmount){ 
            response = "position_1x"
          } else if(position.currentQty == -1*this.TradeAmount){
            response = "position_-1x"
          }
          else if(position.currentQty == 0){
            response = "position_0"
          }
          else{
            response = "error";
          }
        }
        else{
          response = "error";
        }
      }else{
        response = "error";
      }

      return response;
    })
    return response;
  }

  TryToOpenPosition(side:string="Buy"):boolean{
    var currentstatus = this.OpenPositionPreCheck();

    var amount = 0;

    var result = false;
    if(currentstatus == "position_1x"){
      amount = this.TradeAmount*2;
    }else if (currentstatus == "position_-1x"){
      amount = this.TradeAmount*2;
    }else if (currentstatus == "position_0"){
      amount = this.TradeAmount;
    }else if (currentstatus == "cancelled"){
      amount = this.TradeAmount;
    } else if (currentstatus == "error"){
      this.FaultyState = true;
    } else {
      this.FaultyState = true;
    }

    if(amount == 0)
    this.FaultyState = true;
    
    if(!this.FaultyState){
      this.AttemptToBuySellBitcoinWithLimitOrderAtCurrentPrice(amount,15,side).then(res => {
        if(res == "ok"){
          return true;
        }else if (res == "error"){
          this.FaultyState = true;
          return false;
        }
        else if (res == "not filled"){
          return false;
        }else{
          return false;
        }
      })

    }
    return result;
  }

  AttemptToBuySellBitcoinWithLimitOrderAtCurrentPrice(amount:number = this.TradeAmount, tries:number, side="Buy"):Promise<string>{
    var controller = this;

    var firstPriceOfBitCoin = 0;
        
    controller.getCurrentPriceOfBicoin().then((data) => {
      firstPriceOfBitCoin = data[0].bidPrice;
    })

    return new Promise(function cb (resolve) {

      if (--tries > 0) {
        if(controller.FaultyState){
          resolve("error");
        }
  
      var currentPriceOfBTC = 0;

      controller.getCurrentPriceOfBicoin().then((data) => {
        if(side == "Buy")
          currentPriceOfBTC = data[0].bidPrice;
        else if( side == "Sell")
          currentPriceOfBTC = data[0].askPrice;
      })
        SharedService.waitFor(() => currentPriceOfBTC != 0, () => {
          if(currentPriceOfBTC > firstPriceOfBitCoin + 100){
            setTimeout(() => {
              cb(resolve);
            },10000)
           }else if (currentPriceOfBTC < firstPriceOfBitCoin - 100){
            setTimeout(() => {
              cb(resolve);
            },10000)
           }else{
            var order:OrderData|null = null;
            controller.createBuySellOrder(amount, firstPriceOfBitCoin, "Limit", side).then((data) => {
              if(data.text == "error"){
                resolve("error");
              }
              order = data;
            })
    
            SharedService.waitFor(() => order !== null, () => {
              setTimeout(() => {
                var filled = controller.CheckIfOrderFilled();
    
                if(filled === true)
                  resolve("ok");
                else
                  cb(resolve);
  
              }, 10000);
            })
           }
        })
      }else{
        resolve("not filled");
      }
    })
  }

  // creates a buy/sell order for bitcoin
  createBuySellOrder(amount:number = this.TradeAmount, price:number|null=null, ordtype:string = "Limit", side:string = "Buy"): Promise<OrderData> {
    return new Promise((resolve) => {
      this.loader.addRequest();

      if(this.FaultyState){
        this.loader.reduceRequest();
        resolve({text:"error"} as OrderData);
      }
      
      var relativePath = `v1/order?symbol=${this.Symbol}&side=${side}&orderQty=${amount}&ordType=${ordtype}`

      if(price != null){
        relativePath += `&price=${price}`
      }

      var totalUrl = `${this.url}${relativePath}`

      var fullurl = `/api/${relativePath}`
      let options = {headers: this.GenerateHeaders("POST", fullurl)}
    
      this.http.post<OrderData>(totalUrl, options).subscribe(data => {
        this.loader.reduceRequest();
        this.notifier.notify("success", "Successfully created order on Bitmex")
        resolve(data)
      },(err)=>{
        this.notifier.notify("error", "Error creating order on Bitmex (Check environment.ts apikey and apisec)")
        console.log(err)
        this.loader.reduceRequest();
      })
    })
  }

  // cancels (deletes) order(s) by id
  deleteOrders(ids:string[]): Promise<OrderData[]> {
    this.loader.addRequest();
    var relativePath = "v1/order?orderID=" + ids.join(",")
    var totalUrl = `${this.url}${relativePath}`

    var fullurl = `/api/${relativePath}`
    let options = {headers: this.GenerateHeaders("DELETE", fullurl)}

    return new Promise((resolve) => {
      this.http.delete<OrderData[]>(totalUrl, options).subscribe(data => {
        this.loader.reduceRequest();
        this.notifier.notify("success", "Successfully deleted order(s) from Bitmex")
        resolve(data)
      },(err)=>{
        this.notifier.notify("error", "Error deleting order(s) from Bitmex (Check environment.ts apikey and apisec)")
        console.log(err)
        this.loader.reduceRequest();
      })
    })
  }

}
