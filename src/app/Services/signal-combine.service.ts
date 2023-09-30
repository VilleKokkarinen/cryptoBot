import { Injectable } from '@angular/core';
import { BackTestDataObject, ChartDataObject, StrategyData, StrategyDataLight } from '../components/shared/chartdata';

@Injectable({
  providedIn: 'root'
})
export class SignalCombineService {

  constructor() { }

  combineSentiments(
    strategyDataArray: StrategyDataLight[],
    timestamps: number[],
    weights: { [strategyId: string]: number }
  ): BackTestDataObject {

    var result:BackTestDataObject = {
      data: [],
      currentWeight: 0,
      weightRequiredToSwitch: 0,
      currentTime: 0
    };
    
    let previousAction: string | undefined = undefined;
    
    var StrategyCount = Object.keys(weights).length;

    var TotalWeight = 0;

    for(var i = 0; i < StrategyCount; i++){
      TotalWeight += weights[Object.keys(weights)[i]];
    }

    var WeightToFlip = TotalWeight * 0.5; // amount of signal strength needed to flip sides

    var strategyDataArrays:[StrategyDataLight[]] = [[]];

    var activeStrategyweights:number[] = [];

    for(var i = 0; i < StrategyCount; i++){
      strategyDataArrays.push([]);
      activeStrategyweights.push(0);
    }

    strategyDataArray.forEach(item => {
      var indexOfStrategy = Object.keys(weights).indexOf(item.strategy);
      strategyDataArrays[indexOfStrategy].push(item);
    })

    for (let i = 0; i < timestamps.length; i++) {
      const currentTime = timestamps[i];

      let score = 0;
      let action = "";

      var foundStrategys:StrategyDataLight[] = [];
  
      strategyDataArrays.forEach(arrayOfStrategy => {
        for(var j = 0; j < arrayOfStrategy.length; j++){
          var item = arrayOfStrategy[j];
          if(item.time <= currentTime){
            foundStrategys.push(item);
            break;
          }
        }
      });

      foundStrategys.forEach(item => {
        var indexOfStrategy = Object.keys(weights).indexOf(item.strategy);
        var indexOfItem = strategyDataArrays[indexOfStrategy].indexOf(item);

        const weight = weights[item.strategy] || 0;

        var scoreOfItem = 0;
        if(item.text.toLowerCase() == "buy"){
          scoreOfItem += weight;
        }else if(item.text.toLowerCase() == "sell"){
          scoreOfItem -= weight;
        }

        activeStrategyweights[indexOfStrategy] = scoreOfItem;

        strategyDataArrays[indexOfStrategy].splice(indexOfItem, 1);
      })

      activeStrategyweights.forEach(weight => {
        score += weight;
      })

      if(score >= WeightToFlip)
          action = "Buy";
        else if(score <= -WeightToFlip)
          action = "Sell";
  
      if(previousAction !== action && action !== ""){
        if(action == "Buy"){
          result.data.push({time: currentTime, position: "belowBar", color: "green", shape: "arrowUp", text:"Buy", strategy: "combined"})
        }
        else if(action == "Sell"){
          result.data.push({time: currentTime, position: "aboveBar", color: "red", shape: "arrowDown", text:"Sell", strategy: "combined"})
        }
        else if(action == "Hold"){
          //combinedSentiments.push({time: InputData[i].time, position: "belowBar", color: "gray", shape: "circle", text:"Hold", strategy: "combined"})
        }
        previousAction = action;
      }

      if(i == timestamps.length-1){
        result.currentWeight = score;
        result.weightRequiredToSwitch = WeightToFlip;
        result.currentTime = currentTime;
      }
    }
   
    return result;
  }
}