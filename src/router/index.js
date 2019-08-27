import Vue from 'vue'
import Router from 'vue-router'
import VeeValidate from 'vee-validate'
import Quotes from '@/components/Quotes'
import Convert from '@/components/Convert'
import Drawer from '@/components/Drawer'
import Historical from '@/components/Historical'
import HistoricalRatesInPeriod from '@/components/HistoricalRatesInPeriod'
import HistoricalRatesInPeriodGraph from '@/components/HistoricalRatesInPeriodGraph'
import LineGraph from '@/components/LineGraph'
import currencies from '../currencies'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.component('drawer', Drawer)
Vue.component('line-graph', LineGraph)

Vue.use(VueMaterial)
Vue.use(Router)
Vue.use(VeeValidate)

Vue.filter('currencyName', (value) => currencies[value] ? 
        currencies[value].name : value)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'quotes',
            component: Quotes,
            meta: {title: 'Quotes'}
        },
        {
            path: '/convert',
            name: 'convert',
            component: Convert,
            meta: {title: 'Convert'}
        },
        {
            path: '/historical',
            name: 'historical',
            component: Historical,
            meta: {title: 'Historical'}
        },
        {
            path: '/historical-rates-period',
            name: 'historical-rates-period',
            component: HistoricalRatesInPeriod,
            meta: {title: 'Historical Rates in a Period'}
        },
        {
            path: '/historical-rates-period-graph',
            name: 'historical-rates-period-graph',
            component: HistoricalRatesInPeriodGraph,
            meta: {title: 'Historical Rates in a Period'}
        },

    ]
})