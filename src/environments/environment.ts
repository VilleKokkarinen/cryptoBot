export const environment = {
  version:{
    major: 0,
    minor: "001"
  },
  production: false,
  resolution: "1D", // 60 = 1h, 1D = 1 day candles bitmex has dropped support for minutes over 60, and only other is 1D.
  resolutionGroup: 1, // resolution 60 + group 12 => 12h candles ONLY FOR HOURLY!!!
  initialPosAmount: 100, // initial position amount in USD (first pos will be 100, next time going against will be 2x this amount, resulting in 100 short if was 100 long previously)
  symbol:"XBTUSD",
  apikey: "",
  apisec: "",
  allowTrading:false, // if true will actually trade, otherwise will just used as a charting tool.
  continuosSignals:false // if true will show EVERY SINGLE signal, otheriwse only the first one when switches sides.
};
