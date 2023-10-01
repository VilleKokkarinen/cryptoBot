import { Injectable } from '@angular/core';
import { ChartDataObject, StrategyData, StrategyDataLight } from '../components/shared/chartdata';
import { Action, Asset, StrategyInfo, StrategyResult } from 'indicatorts';
import { environment } from 'src/environments/environment';
import { SettingsService } from './settings.service';

export class GainsAndLosses{
  actionResult!: number[];
  currentValue!: number[];
}
export class StrategyResultImproved implements StrategyResult{
  info!: StrategyInfo;
  gain!: number;
  lastAction!: Action;

  maxGain!: number;
  maxLoss!: number;

  avgGain!: number;
  avgLoss!: number;

  numOfGains!: number;
  numOfLosses!: number;

}


@Injectable({
  providedIn: 'root'
})
export class BacktestService {

  initialPosAmount = environment.initialPosAmount;
  initialBalance = 10000; // XBT

  contractValueMultiplier = 10000000; // for XBTUSD
  baseContractValue = 0.0000001 // 100 XBt (satoshi)
  adjustedContractValue = 1; //xbtusd contract value is 1 usd

  constructor(private settingsService: SettingsService) {
    
    this.settingsService.SettingsChange.subscribe((data)=>{
      //for example ethusd contract value is not 1 usd, but 100 satoshi per 1$ of eth, eg. if eth is 1500$ then contract value is 0.000001 * 1500 = 0.0015 XBT
      
      if(data.contractMultiplier >= 1)
      this.adjustedContractValue = this.baseContractValue * data.contractMultiplier;
    })

   }

  checkSameLength(...values: number[][]): void {
    if (values.length > 0) {
      const length = values[0].length;
  
      for (let i = 1; i < values.length; i++) {
        if (values[i].length !== length) {
          throw new Error(`values length at ${i} not ${length}`);
        }
      }
    }
  }

  applyActions(closings: number[], actions: Action[]): GainsAndLosses {
    this.checkSameLength(closings, actions);
  
    var actionResult = [];
    var currentValue = [];
  
    let balance = this.initialBalance;
  
    var previousPrice = closings[0];

    for (let i = 0; i < closings.length; i++) {
      var RealisedProfit = 0;
      var currentPrice = closings[i];

      if (actions[i] === Action.BUY) {
        if (balance > 0) {

          if(i > 0){

            if(this.adjustedContractValue == 1) // "XBTUSD"
            {
              RealisedProfit = ((1/previousPrice) - (1/currentPrice))*this.initialPosAmount
            
            }else{ // ETHUSD etc, which are margined against XBT
              var margin = this.initialPosAmount * this.adjustedContractValue*previousPrice;
              RealisedProfit = ((100/previousPrice) - (100/currentPrice))*this.initialPosAmount*this.adjustedContractValue*currentPrice
              RealisedProfit = margin*RealisedProfit;
            }

            RealisedProfit = -1*RealisedProfit;  // -1 is because contract amount should be negative but it's positive in the settings...

            //console.log(`Sold at ${previousPrice} and bought at ${currentPrice} resulting in a profit of ${RealisedProfit} XBT`)
          }
         
        }
      } else if (actions[i] === Action.SELL) {
        if (balance > 0) {

          if(i > 0){
            if(this.adjustedContractValue == 1) // "XBTUSD"
            {
              RealisedProfit = ((1/previousPrice) - (1/currentPrice))*this.initialPosAmount
            
            }else{ // ETHUSD etc, which are margined against XBT
              var margin = this.initialPosAmount* this.adjustedContractValue *previousPrice;
              RealisedProfit = ((100/previousPrice) - (100/currentPrice))*this.initialPosAmount*this.adjustedContractValue*currentPrice
              RealisedProfit = margin*RealisedProfit;
            }

            //console.log(`Bought at ${previousPrice} and sold at ${currentPrice} resulting in a profit of ${RealisedProfit} XBT`)
          }
        }
      }
      balance += RealisedProfit
      //console.log(`Backtest wallet value in xbt: ${balance} | ${RealisedProfit > 0 ? 'Profit of' : 'Loss of'} ${RealisedProfit} XBT`);

      currentValue.push(balance);
      actionResult.push(RealisedProfit);
      previousPrice = JSON.parse(JSON.stringify(currentPrice));
    }

    var result:GainsAndLosses = {actionResult:actionResult, currentValue:currentValue};

    return result;
  }

  backtest(
    asset: Asset,
    infos: StrategyInfo[]
  ): StrategyResultImproved[] {
    const result = new Array<StrategyResultImproved>(infos.length);
  
    for (let i = 0; i < result.length; i++) {
      const actions = infos[i].strategy(asset);
      const actionResult = this.applyActions(asset.closings, actions);
  
      var maxGain = 0;
      var maxLoss = 0;
      var avgGain = 0;
      var avgLoss = 0;
      var numOfGains = 0;
      var numOfLosses = 0;

      for(var j = 0; j < actionResult.actionResult.length; j++){
        if(actionResult.actionResult[j] > maxGain)
          maxGain = actionResult.actionResult[j];

        if(actionResult.actionResult[j] < maxLoss)
          maxLoss = actionResult.actionResult[j];
        
        if(actionResult.actionResult[j] > 0){
          avgGain += actionResult.actionResult[j];
          numOfGains++;
        }
        else{
          avgLoss += actionResult.actionResult[j];
          numOfLosses++;
        }


      }

      avgGain /= actionResult.actionResult.length;
      avgLoss /= actionResult.actionResult.length;

      result[i] = {
        info: infos[i],
        gain: actionResult.currentValue[actionResult.currentValue.length - 1]-this.initialBalance,
        lastAction: actions[actions.length - 1],
        maxGain: maxGain,
        maxLoss: maxLoss,
        avgGain: avgGain,
        avgLoss: avgLoss,
        numOfGains: numOfGains,
        numOfLosses: numOfLosses
      };
    }
  
    //console.log("backtest result details",result[0])

    //result.sort((a, b) => b.gain - a.gain);
  
    return result;
  }

}