import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  constructor() { }

  static waitFor(condition:any, callback:any, maxCallBacks:number = 10, sleep:number = 500) {
    if(!condition() || (maxCallBacks > 0 && !condition())) {
        maxCallBacks--;

        if(this == null ||window == null)
        callback();

        window.setTimeout(this.waitFor.bind(null, condition, callback, maxCallBacks), sleep);
    } else {
        callback();
    }
  }

  static numberAbbreviator(n:number,d:number) {
    var x=(''+n).length,p=Math.pow,d=p(10,d)
    x-=x%3
    return Math.round(n*d/p(10,x))/d+" kmgtpe"[x/3]
  }
  
  static UTCDATE(d:Date) {
    if (!d)
      d = new Date();
    var year = d.getUTCFullYear();
    var month = d.getUTCMonth();
    var day = d.getUTCDate();
    var hours = d.getUTCHours();
    var minutes = d.getUTCMinutes();
    var seconds = d.getUTCSeconds();
    var utcDate = new Date(year, month, day, hours, minutes, seconds);
    return utcDate
  }


  static scrollToBottom(id:string = "") {
      if(id == ""){
        setTimeout(() => {
        const maxScroll = document.getElementsByClassName('content')[0].scrollHeight;
        document.getElementsByClassName('content')[0].scrollTo({ top: maxScroll, behavior: 'smooth' });
      }, 50);
      }else{
        this.waitFor(()=> document.getElementById(id) !== null, () => {
          var element = document.getElementById(id);
          if(element != null){
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest"
              });
            }
        },50,70)
      }
  }
}
