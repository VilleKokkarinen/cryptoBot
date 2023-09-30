export class OrderData{
    side: string = "";
    price: number = 0;
    text: string = "";
    symbol:string = "";
    orderQty:number = 0;
    timeInForce:string = "";
    execInst:string = "";
    ordStatus:string = "";
    triggered:string = "";
    account:number = 0;
    orderID:string = "";
}

export class PositionData{
    account:number = 0;
    symbol:string = "";
    currency:string = "";
    openingQty:number = 0;
    currentQty:number = 0;
    isOpen:boolean = false;
    timestamp:string = "";
}

export class InstrumentData{
    symbol:string = "";
    lastPrice:number = 0;
    askPrice:number = 0; // this is the selling side
    bidPrice:number = 0; // this is the buying side
}