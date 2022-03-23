const C = {
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    TIMEFRAMES: ['m1', 'm5', 'm15', 'm30', 'H1', 'H2', 'H3', 'H4', 'H6', 'H8', 'D1', 'W1', 'M1'],
    getTF: (tf) => {
        return tf.replace(/m/i,'m').replace(/h/i,'H').replace(/d/i,'D1')
    },
    historicalID: ({ pair, timeframe }) => `${pair}-${timeframe}`,
}

module.exports = C
