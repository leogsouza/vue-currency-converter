<template>
  <div class="page-container md-layout-column">
    <drawer></drawer>
    <div class="container">
      <h1 class="center">Historical Exchange Rates in a Period Graph</h1>
      <form @submit.prevent="getHistoricalRate">
        <div class="md-layout-item">
          <label>Start Date</label>
          <ValidatorProvider rules="required" v-slot="{ errors }">
          <md-datepicker v-model="form.startDate"
            name="date"
            :md-disabled-dates="invalidStartDates"
          ></md-datepicker>
          </ValidatorProvider>
          <label>End Date</label>
          <ValidatorProvider rules="required" v-slot="{ errors }">
          <md-datepicker v-model="form.EndDate"
            name="date"
            :md-disabled-dates="invalidEndDates"></md-datepicker>
          </ValidatorProvider>
          <md-field :class="{'md-invalid': errors.first('from') }">
            <label for="from">Currency to Convert From</label>
            <ValidatorProvider rules="required" v-slot="{ errors }">
            <md-select v-model="form.from" name="from"
              >
              <md-option :value="s.code" v-for="s in fromSymbols"
                :key="s.code">{{s.name}}</md-option>
            </md-select>
            <span class="md-error">{{errors.first('from')}}</span>
            </ValidatorProvider>
          </md-field>
          <md-field :class="{'md-invalid': errors.first('to') }">
            <label for="to">Currency to Convert To</label>
            <ValidatorProvider rules="required" v-slot="{ errors }">
            <md-select v-model="form.to" name="to"
              >
              <md-option :value="s.code" v-for="s in toSymbols"
                :key="s.code">{{s.name}}</md-option>
            </md-select>
            <span class="md-error">{{errors.first('to')}}</span>
            </ValidatorProvider>
          </md-field>
        </div>
        <md-button class="md-dense md-raised md-primary" type="submit">
          Find Historical Rates
        </md-button>
      </form>
      <div>
        <line-graph v-if="hasResult && !resultNotFound" :chartdata="graphData"
          :options="options"></line-graph>
        <h2 v-if="hasResult && resultNotFound">Exchange rates not found.</h2>
      </div>
    </div>
  </div>
</template>

<script>
import currencies from '../currencies'
import { APIURL } from '../urls'
import * as moment from 'moment'
const request = require('superagent')

export default {
  data() {
    return {
      form: {
        startDate: new Date(),
        endDate: new Date(),
        from: '',
        to: ''
      },
      reates: [],
      symbols: [],
      fromSymbols: [],
      toSymbols: [],
      currencies,
      graphData: {},
      options: {
        responsive: true,
        maintainAspectRation: false
      },
      hasResult: false,
      resultNotFound: false
    }
  },
  watch: {
    form: {
      handler() {
        if (!this.form) {
          this.toSymbols = this.symbols
          this.fromSymbols = this.symbols
          return
        } 

        if (this.form.from) {
          this.toSymbols = this.symbols.filter(s => s.code != this.form.from)
        }

        if (this.form.to) {
          this.fromymbols = this.symbols.filter(s => s.code != this.form.to)
        }
      },
      deep: true
    }
  },
  methods: {
    getHistoricalRate(evt) {
      this.hasResult = false
      evt.preventDefault()
      if (this.errors.items.length > 0) {
        return
      }

      request.get(`${APIURL}/history?start_at=${moment(this.form.startDate)
          .format('YYYY-MM-DD')}&end_at=${moment(this.form.endDate)
          .format('YYYY-MM-DD')}&base=${this.form.from}`)
        .end((err, res) => {
          let body = res.body
          this.hasResult = true
          if (!body.rates) {
            this.resultNotFound = true
            return
          } else {
            this.resultNotFound = false
          }

          let rates = Object.keys(body.rates).map(date => {
            return {
              date: moment(date).format('YYYY-MM-DD'),
              rates: Object.keys(body.rates[date]).map(k => {
                return {
                  symbol: k,
                  rate: body.rates[date][k]
                }
              })
            }
          })
          .sort((a, b) => +new Date(a.date) - +new Date(b.date))

          let exchangeRates = []
          rates.forEach(r => {
            let currency = r.rates.find(rr => rr.symbol == this.form.to)
            let rate
            if (currency) {
              rate = currency.rate
            }
            if (rate) {
              exchangeRates.push(rate)
            }
          })

          this.graphData = {
            labels : rates.map(r => r.date),
            datasets: [{
              label: `Exchange rate ${this.form.from} - ${this.form.to}`,
              backgroundColor: '#F87979',
              data: exchangeRates,
              fill: false
            }]
          }

          if (exchangeRates.length == 0) {
            this.resultNotFound = true
          }
        })
    },
    invalidStartDates(evt) {
      return +evt > +new Date()
    },
    invalidEndDates(evt) {
      return +evt < +this.form.startDate || +evt > +new Date()
    }
  },
  beforeMount() {
    this.symbols = Object.keys(this.currencies).map(k => {
      return {
        symbol: k,
        ...this.currencies[k]
      }
    })
    this.toSymbols = JSON.parse(JSON.stringify(this.symbols))
    this.fromSymbols = JSON.parse(JSON.stringify(this.symbols))
  }
}
</script>

<style scoped>

</style>