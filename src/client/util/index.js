import Highcharts from 'highcharts/highstock'
import Indicators from 'highcharts/indicators/indicators'
import EMA from 'highcharts/indicators/ema'

// add highcharts plugins and set global options
const initHighcharts = () => {
  Indicators(Highcharts)
  EMA(Highcharts)
  Highcharts.setOptions({
    credits: {
      enabled: false
    },
    plotOptions: {
      ema: {
        marker: {
          enabled: false
        }
      }
    },
    rangeSelector: {
      inputBoxWidth: 120,
      inputDateFormat: '%Y-%m-%d %H:%M',
      inputEditDateFormat: '%Y-%m-%d %H:%M',
      selected: 3,
      buttons: [{
        type: 'hour',
        count: 1,
        text: '1h'
      },{
        type: 'hour',
        count: 3,
        text: '3h'
      },{
        type: 'hour',
        count: 12,
        text: '12h'
      },{
        type: 'day',
        count: 1,
        text: '1d'
      },{
        type: 'week',
        count: 1,
        text: '1w'
      },{
        type: 'month',
        count: 1,
        text: '1m'
      },{
        type: 'month',
        count: 3,
        text: '3m'
      },{
        type: 'month',
        count: 6,
        text: '6m'
      },{
        type: 'ytd',
        text: 'YTD'
      },{
        type: 'year',
        count: 1,
        text: '1y'
      },{
        type: 'all',
        text: 'All'
      }]
    },
  })
}

export { default as api } from './api'
export default { initHighcharts }