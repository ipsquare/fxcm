// src/lib/price.js

const _ = require('lodash')

function getMidPrice(lowerPrice, upperPrice, priceType) {
    const standardMidPrice = upperPrice > lowerPrice && lowerPrice + (upperPrice - lowerPrice) / 2
    const scewedMidPrice = upperPrice < lowerPrice && upperPrice + (lowerPrice - upperPrice) / 2

    return standardMidPrice || scewedMidPrice || upperPrice
}

const roundDecimal = (num) => num.toFixed(2)

function normalisePrice(symbol, price) {
    return symbol.includes('JPY') || symbol.includes('HUF') ? _.round(price, 3) : _.round(price, 5)
}

// function denormalisePairValue(symbol, value) {
//     return symbol.includes('JPY') || symbol.includes('HUF')
//         ? parseFloat((parseFloat(value) / 100).toFixed(3))
//         : parseFloat((parseFloat(value) / 10000).toFixed(5))
// }

function removeCurrentCandle(data) {
    // const sortedData = data.sort((oldest, newest) => moment(oldest.timestamp).diff(moment(newest.timestamp)))
    const sortedData = _.sortBy(data, 'timestamp')
    sortedData.pop()
    return sortedData
}

module.exports = {
    getMidPrice,
    normalisePrice,
    // denormalisePairValue,
    removeCurrentCandle,
}
