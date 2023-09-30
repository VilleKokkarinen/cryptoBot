# Angular cryptoBot / charting tool
This project is meant mainly for backtesting strategies, but is also capable of placing orders automatically to trade long & short sequentially.

(eg. goes long, and then when signal is given for sell, starts shorting at same amount, and the cycle repeats.)
currently the trading only happens on startup, but if you want you could automate it to run every x second, minute, day.

The api is using bitmex's api, so you will most likely need api keys for this to function fully.

Backtesting result is found in the console output of your browser.


## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Adding api keys etc.

configure src/environments/environment.ts / prod.ts if building for production
-> all the options explained.