# fxcm
Minimalist Node.js client for programmatically trading with FXCM REST API

# Installation

```
yarn add 'https://github.com/ipsquare/fxcm#master'
````

# Import

ES6 Import:

```
import FXCM from 'fxcm'
```

CommonJS:

````
const FXCM = require('fxcm')
````

# Usage

```
const config = {
  token: "PASTE_YOUR_FXCM_TOKEN_HERE",
  isDemo: true
}

const fxcm = new FXCM(config)

// Get 30min historical candle data for USD/CAD. Max 50 data points (live/current candle is removed by default)

const result = await fxcm.historical({ symbol: 'EUR_JPY', tf: 'm15', datapoints: 3 })
console.log({ result })

// Get current market data for your subscribed symbols (subscription list can be edited at tradingstation.fxcm.com)
const result = await fxcm.markets()
console.log({ result })
```
