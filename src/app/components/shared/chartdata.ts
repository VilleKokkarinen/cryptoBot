import { ChartOptions, ColorType, PriceScaleMode, CrosshairMode, LineStyle, TrackingModeExitMode } from "lightweight-charts";

export class ChartData{
  c:number[] = [];
  h:number[] = [];
  l:number[] = [];
  o:number[] = [];
  t:number[] = [];
  v:number[] = [];
}

export class BackTestDataObject {
  data:StrategyData[] = [];
  currentWeight: number = 0; // the most recent/current weight of the strategy
  weightRequiredToSwitch: number = 0; // the amount of weight required to switch sides
  currentTime: number = 0; // the most recent/current time
}

export class StrategyDataLight {
  time: number = 0; // epoch time when the action was produced
  text: string = ""; // the action, one of the following: "buy", "sell", "hold"
  strategy: string = ""; // the strategy id
}

export class StrategyData{
  time: number = 0;
  position: string = "";
  color: string = "";
  shape: string = "";
  text: string = "";
  strategy: string = "";
}

export class ChartDataObject{
  close:number = 0;
  high:number = 0;
  low:number = 0;
  open:number = 0;
  time:number = 0;
  volume:number = 0;
}

export class ChartDataVolumeObject{
  value:number = 0;
  time:number = 0;
}

export const DefaultChartOptions: ChartOptions = {
  layout: {
    textColor: 'rgba(230, 216, 25, 1)', background: { type: ColorType.Solid, color: '#000000' },
    fontSize: 14,
    fontFamily: 'Roboto'
  },
  width: 0,
  height: 0,
  autoSize: true,
  handleScroll: true,
  handleScale: true,
  watermark: {color: "", fontFamily:'', fontStyle:'', visible:false, fontSize: 0, text: "", horzAlign: 'left', vertAlign: 'top'},
  leftPriceScale: {
    autoScale: true,
    mode: PriceScaleMode.Normal,
    invertScale: false,
    alignLabels: true,
    scaleMargins: {
      top: 0.25,
      bottom: 0.25
    },
    borderVisible: true,
    borderColor: 'rgba(230, 216, 25,1)',
    entireTextOnly: false,
    visible: false,
    ticksVisible: true
  },
  rightPriceScale: {
    autoScale: true,
    mode: PriceScaleMode.Normal,
    invertScale: false,
    alignLabels: true,
    scaleMargins: {
      top: 0.25,
      bottom: 0.25
    },
    borderVisible: true,
    borderColor: 'rgba(230, 216, 25,1)',
    entireTextOnly: false,
    visible: true,
    ticksVisible: true
  },
  overlayPriceScales: {
    mode: PriceScaleMode.Normal,
    invertScale: false,
    alignLabels: true,
    scaleMargins: {
      top: 0.25,
      bottom: 0.25
    },
    borderVisible: true,
    borderColor: '',
    entireTextOnly: false,
    ticksVisible: false
  },
  timeScale:  {
    rightOffset: 6,
    barSpacing: 6,
    minBarSpacing: 0.5,
    fixLeftEdge: false,
    fixRightEdge: false,
    lockVisibleTimeRangeOnResize: false,
    rightBarStaysOnScroll: false,
    borderVisible: true,
    borderColor: 'rgba(230, 216, 25, 1)',
    visible: true,
    timeVisible: true,
    secondsVisible: true,
    shiftVisibleRangeOnNewBar: true,
    ticksVisible: true
  },
  crosshair:  {
    mode: CrosshairMode.Normal,
    vertLine:  {
      color: 'rgba(230, 216, 25,0.35)',
      width: 1,
      style: LineStyle.Dashed,
      visible: true,
      labelVisible: false,
      labelBackgroundColor: 'white'
    },
    horzLine: {
      color: 'rgba(230, 216, 25,0.35)',
      width: 1,
      style: LineStyle.Dashed,
      visible: true,
      labelVisible: true,
      labelBackgroundColor: 'yellow'
    },
  },
  grid: {
    vertLines:  {
      color: 'rgba(230, 216, 25,0.25)',
      style: LineStyle.Solid,
      visible: false
    },
    horzLines: {
      color: 'rgba(230, 216, 25,0.25)',
      style: LineStyle.Solid,
      visible: true
    },
  },
  localization: {
    locale: 'fi-FI',
    dateFormat: 'dd/MM/yyyy',
  },
  kineticScroll:  {
    touch: true,
    mouse: false
  },
  trackingMode: {
    exitMode: TrackingModeExitMode.OnTouchEnd
  },
};