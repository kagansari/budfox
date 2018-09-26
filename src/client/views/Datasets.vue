<template>
  <div class="datasets">
    <div v-if="loading">
      Loading
    </div>
    <b-table id="datasets-table" :items="datasets" :fields="tableFields" @row-clicked="rowClicked" striped hover/>
  </div>
</template>

<script>
import moment from 'moment'
import { api } from '../util'

// datasets table column informations
const tableFields = [
  'exchange',
  'symbol',
  {
    key: 'from',
    formatter: 'formatDate'
  },{
    key: 'to',
    formatter: 'formatDate'
  }, {
    key: 'duration',
    formatter: 'formatDuration'
  }
]

export default {
  name: 'Datasets',
  data() {
    return {
      loading: true,
      tableFields
    }
  },
  methods: {
    mockDatasets() {
      return [
        {from:1533463200000,to:1533596340000,exchange:'binance',symbol:'BTC/USDT'},
        {from:1533081600000,to:1533164340000,exchange:'binance',symbol:'TRX/USDT'},
        {from:1533463200000,to:1533596340000,exchange:'binance',symbol:'TRX/USDT'}
      ]
    },
    datasets(ctx, cb) {
      api.get('datasets').then(datasets => {
        this.loading = false
        cb(datasets)
      })
    },
    formatDate(ts) {
      return moment(ts).toISOString()
    },
    formatDuration(value, key, item) {
      return moment.duration(moment(item.to).diff(item.from)).humanize()
    },
    // go to clicked dataset page
    rowClicked(item) {
      const { exchange, symbol } = item
      const from = moment(item.from).toISOString()
      const to = moment(item.to).toISOString()
      this.$router.push(`/datasets/${exchange}/${symbol}/${from}/${to}`)
    }
  }
}
</script>

<style>
table#datasets-table tr:hover {
  cursor: pointer;
}
</style>

