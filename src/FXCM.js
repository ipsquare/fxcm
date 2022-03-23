// src/FXCM.js

const D = false

const C = require('./lib/constants'),
    api = require('./lib/api'),
    { getMidPrice, normalisePrice, removeCurrentCandle } = require('./lib/price'),
    offers = require('./lib/offers.json')

const { log } = console,
    dayjs = require('dayjs'),
    utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

class FXCM {
    constructor({ token, isDemo }) {
        this.fxcm = api({ token, isDemo })
        this.loggedIn = false
    }

    async initialise() {
        if (!this.loggedIn) {
            try {
                this.loggedIn = await this.fxcm.authenticate()
            } catch (err) {
                console.error('Error with fxcm initialise', err)
            }
        }
    }

    async logout() {
        if (this.loggedIn) {
            await this.fxcm.logout()
            this.loggedIn = false
        }
    }

    async markets() {
        await this.initialise()
        try {
            const response = await this.fxcm.request('GET', '/trading/get_model', { models: ['Offer'] })

            if (!response || !response.offers) {
                log('ERROR - No Market Offers returned from API')
                return []
            }

            return response.offers.map(({ time, buy, sell, spread, currency }) => {
                // const dateTimeMoment = moment(time, moment.ISO_8601)
                const dateTimeMoment = dayjs(time).utc()

                const currentPrice = normalisePrice(currency, getMidPrice(buy, sell))

                return {
                    currentPrice,
                    currency,
                    spread,
                    timeUpdated: dateTimeMoment.format(C.TIME_FORMAT),
                    dateUpdated: dateTimeMoment.format(C.DATE_FORMAT),
                    timestamp: dateTimeMoment.unix(),
                }
            })
        } catch (err) {
            console.error(err)
        }
    }
    async getSymbols(visible = false) {
        await this.initialise()
        try {
            // send { "method":"GET", "resource":"/trading/get_instruments" }
            const response = await this.fxcm.request('GET', '/trading/get_instruments')

            D && log({ response })
            if (!response || !response.data || !response.data.instrument) {
                console.log('ERROR - No "data.instrument" returned from API')
                return []
            }

            return response.data.instrument
        } catch (err) {
            console.error(err)
        }
    }

    async historical({ symbol, tf = 'm30', datapoints = 1, priceType = 0 }) {
        await this.initialise()
        try {
            symbol = symbol.replace(/_/, '/')
            const { offerId } = offers.find((offer) => offer.currency === symbol && offer.offerId)

            if (!offerId || C.TIMEFRAMES.indexOf(tf) === -1) {
                console.error(`Timeframe: '${tf}' or Pair: '${symbol}' not found`)
                return []
            }

            const { response, candles } = await this.fxcm.request('GET', `/candles/${offerId}/${tf}`, {
                num: datapoints + 1,
            })

            if (response.error !== '' || candles.length === 0)
                throw new Error(`Error with historical response - returned candles: ${candles}`)

            if (priceType === 1) return candles

            const formattedPrices = candles.map((price) => {
                const [timestamp, bidOpen, bidClose, bidHigh, bidLow, askOpen, askClose, askHigh, askLow, vol] = price

                const close = getMidPrice(bidClose, askClose, priceType)
                const open = getMidPrice(bidOpen, askOpen, priceType)
                // const mid = getMidPrice(open, close, priceType)
                const high = getMidPrice(bidHigh, askHigh, priceType)
                const low = getMidPrice(bidLow, askLow, priceType)

                return {
                    symbol,
                    tf,
                    timestamp: timestamp * 1000,
                    // datetime: moment.unix(timestamp).format(C.DATETIME_FORMAT),
                    // datetime: dayjs.unix(timestamp).utc().format(C.DATETIME_FORMAT),
                    high: normalisePrice(symbol, high),
                    low: normalisePrice(symbol, low),
                    close: normalisePrice(symbol, close),
                    open: normalisePrice(symbol, open),
                    // mid: normalisePrice( symbol, mid }),
                    highD: normalisePrice(symbol, askHigh - bidHigh),
                    lowD: normalisePrice(symbol, askLow - bidLow),
                    vol,
                }
            })
            // return removeCurrentCandle(formattedPrices)
            return formattedPrices
        } catch (err) {
            console.error(`Error with symbol: ${symbol}. ${err}`)
        }
    }
}

module.exports = FXCM
