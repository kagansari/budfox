<template>
  <div class="dataset">
    <div id="chart"></div>
  </div>
</template>

<script>
import Highcharts from 'highcharts/highstock'
import moment from 'moment'
import { api } from '../util'

export default {
  name: 'Dataset',
  methods: {
    formatDate(date) {
      return moment(date).toISOString()
    },
    /**
     * @param {[[TS,O,H,L,C,V]]} dataset
     */
    initChart(dataset) {
      const { base, quote, from, to } = this.$route.params
      const symbol = `${base}/${quote}`
      const durationStr = moment.duration(moment(to).diff(from)).humanize()

      Highcharts.stockChart('chart', {
        title: {
          text: `${symbol} - ${durationStr}`
        },
        series: [{
          type: 'candlestick',
          id: symbol,
          name: symbol,
          data: dataset
        }]
      })
    }
  },
  mounted() {
    const { exchange, base, quote } = this.$route.params
    const from = moment(this.$route.params.from).valueOf()
    const to = moment(this.$route.params.to).valueOf()
    api.get(`datasets/${exchange}/${base}/${quote}/${from}/${to}`)
    .then(dataset => {
      this.initChart(dataset)
    })
  }
}
</script>
