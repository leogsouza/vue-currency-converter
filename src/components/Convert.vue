<template>
    <div class="page-container md-layout-column">
        <drawer></drawer>
        <div class="container">
            <h1 class="center">Convert Currency</h1>
            <form @submit.prevent="convert">
                <div class="md-layout-item">
                    <ValidatorProvider rules="required" v-slot="{ errors }">
                    <md-field :class="{'md-invalid': errors.first('price') }">
                        <label>Amount of Currency to Convert From</label>
                        <md-input v-model="form.price"
                            name="price"></md-input>
                            <span class="md-error">{{ errors.first('price') }}</span>
                    </md-field>
                    </ValidatorProvider>
                    <ValidatorProvider rules="required" v-slot="{ errors }">
                    <md-field :class="{'md-invalid': errors.first('from')}">
                        <label for="from">Currency to Convert From</label>
                        <md-select v-model="form.from" name="from">
                            <md-option :value="s.code" v-for="s in fromSymbols"
                                :key="s.code">{{s.name}}</md-option>
                        </md-select>
                        <span class="md-error">{{errors.first('from')}}</span>
                    </md-field>
                    </ValidatorProvider>
                    <ValidatorProvider rules="required" v-slot="{ errors }">
                    <md-field :class="{'md-invalid': errors.first('to')}">
                        <label for="to">Currency to Convert To</label>
                        <md-select v-model="form.to" name="to">
                            <md-option :value="s.code" v-for="s in toSymbols" :key="s.code">
                                {{s.name}}                                
                            </md-option>
                        </md-select>
                        <span class="md-error">{{errors.first('to')}}</span>
                    </md-field>
                    </ValidatorProvider>
                </div>
                <md-button class="md-dense md-raised md-primary" type="submit">
                    Convert
                </md-button>
            </form>
            <div class="center" v-if="hasResult">
                <h2 v-if="isNumber(result)">
                    {{form.price | currencyName}} {{form.from}} is {{result}} {{form.to | currencyName}}
                </h2>
                <h2 v-if="!isNumber(result)">Exchange rate not found</h2>
            </div>
        </div>
    </div>
</template>

<script>
import currencies from '../currencies'
import { APIURL} from '../urls'
import * as moment from 'moment'
const request = require('superagent')

export default {
    name: 'convert',
    data() {
        return {
            form: {
                price: 0,
                from: '',
                to: ''
            },
            result: null,
            currencies,
            currentTime: '',
            err: null,
            hasResult: false,
            symbols: [],
            fromSymbols: [],
            toSymbols: []
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

                this.hasResult = false
                if (this.form.from) {
                    this.toSymbols = this.symbols.filter(s => s.code != this.form.from)
                }

                if (this.form.to) {
                    this.fromSymbols = this.symbols.filter(s => s.code != this.form.to)
                }
            },
            deep: true
        }
    },
    methods: {
        convert(evt) {
            this.hasResult = false
            evt.preventDefault()
            if (this.errors.items.length > 0) return

            request.get(`${APIURL}/latest?base=${this.form.from}`).end((err, res) => {
                let body = res.body
                this.hasResult = true
                this.result = (+this.form.price * +body.rates[this.form.to]).toFixed(2)
                this.currentTime = moment(this.result.timestamp * 1000)
                    .format('YYYY-MM-DD HH:mm:ss a')
            })
        },
        isNumber(number) {
            return !isNaN(number)
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
    .result {
        margin-top: 30px;
    }
</style>