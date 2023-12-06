import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import pdfStore from './pdf'
const store = new Vuex.Store({
    modules: {
        pdfStore: pdfStore
    }
})

export default store
