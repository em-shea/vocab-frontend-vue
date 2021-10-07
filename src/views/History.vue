<template>

  <div id="history">
  <!-- Shows daily word history for the past ~3 months for given HSK level -->
    <char-set-toggle :charSetWidth="charSetWidth"></char-set-toggle>
    <small-header></small-header>
    <!-- <nav-bar v-if="mobileDevice === false"></nav-bar> -->

    <div class="container">
      <div class="row m-3">
        <div class="col-lg-3 col-md-3 col-sm-9 col-9 p-2 title-col">
          <h5 class="title">
            Review daily words
          </h5>
        </div>
        <!-- Export button above/to the left of dropdowns on sm. and smaller -->
        <div class="d-block d-md-none col-3 p-2">
          <button class="btn btn-light btn-shadow" title="Export currently selected words to Excel." type="button" v-on:click="exportCSV();">Export</button>
        </div>
        <div class="col-lg-3 col-md-3 col-sm-6 p-2">
          <select class="custom-select" v-on:change="getWordHistory()" v-model="params.list">
            <option v-for="(name, key) in levelList" :value="key" v-bind:key="key">
              {{ name }}
            </option>
          </select>
        </div>
        <div class="col-lg-3 col-md-3 col-sm-6 p-2">
          <select class="custom-select"  v-on:change="getWordHistory()" v-model="params.date_range">
            <option v-for="(days, key) in dateRange" :value="key" v-bind:key="key">
              {{ days }}
            </option>
          </select>
        </div>
        <!-- Export button below/to the right of dropdowns on med. and larger -->
        <div class="col-lg-1 col-md-1 d-none d-md-block"></div>
        <div class="col-lg-2 col-md-2 d-none d-md-block p-2">
          <button class="btn btn-light btn-shadow float-right" title="Export currently selected words to Excel." type="button" v-on:click="exportCSV();">Export</button>
        </div>
      </div>
    </div>

    <!-- <div class="container">
      <div class="row justify-content-center m-1">
        <div class="col-3">
          <select class="custom-select" v-on:input="getWordHistory()" v-model="params.list">
            <option v-for="(name, key) in levelList" :value="key" v-bind:key="key">
              {{ name }}
            </option>
          </select>
        </div>
        <div class="col-3">
          <select class="custom-select"  v-on:input="getWordHistory()" v-model="params.date_range">
            <option v-for="(days, key) in dateRange" :value="key" v-bind:key="key">
              {{ days }}
            </option>
          </select>
        </div>
      </div>
    </div> -->

    <div class="container">
      <div class="row card-deck m-3">
        <div class="card-holder col-xl-3 col-md-4 col-sm-6" v-for="card in wordHistoryList" :key="card['ListId']+card['Date']">
          <word-history-card :card="card"></word-history-card>
        </div>
      </div>
    </div>

    <custom-footer :footerWidth="footerWidth"></custom-footer>

  </div>

</template>

<script>
// @ is an alias to /src
import smallHeader from '@/components/smallHeader.vue'
import wordHistory from '@/components/wordHistory.vue'
import * as XLSX from 'xlsx'
import customFooter from '@/components/footer.vue'
import characterSetToggle from '@/components/characterSetToggle.vue'

export default {
  name: 'history',
  components: {
    'small-header': smallHeader,
    'word-history-card': wordHistory,
    'custom-footer': customFooter,
    'char-set-toggle': characterSetToggle
  },
  data () {
    return {
      wordHistoryList: [],
      page: 0,
      levelList: { HSKLevel1: 'HSK Level 1', HSKLevel2: 'HSK Level 2', HSKLevel3: 'HSK Level 3', HSKLevel4: 'HSK Level 4', HSKLevel5: 'HSK Level 5', HSKLevel6: 'HSK Level 6' },
      dateRange: { 30: 'Past 30 days', 60: 'Past 60 days', 90: 'Past 90 days' },
      params: {
        list: 'HSKLevel1',
        date_range: 30
      },
      footerWidth: 'narrow',
      charSetWidth: 'narrow'
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    },
    mobileDevice () {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    }
  },
  watch: {
    characterSet: function () {
      this.pushToRouter()
    }
  },
  mounted () {
    this.checkInitialParams()
    this.getWordHistory()
  },
  methods: {
    pushToRouter () {
      if (this.$route.query.list !== this.params.list || this.$route.query.dates !== this.params.date_range || this.$route.query.char !== this.characterSet) {
        this.$router.push({ query: { 'list': this.params.list, 'dates': this.params.date_range, 'char': this.characterSet } })
        // console.log('pushToRouter()', this.params.list, this.params.date_range, this.characterSet)
      }
    },
    checkInitialParams () {
      // Check if acceptable parameters have been passed (HSK 1-6, 30-90 days, simplified/traditional)
      if (this.$route.query.list in this.levelList) {
        this.params.list = this.$route.query.list
      }
      if (this.$route.query.dates in this.dateRange) {
        this.params.date_range = this.$route.query.dates
      }
      // Because the word history API response contains both simplified and traditional characters always,
      // the 'char' query param works differently than the list and dates ones.
      // We update the characterSet var in the global state machine and push to the URL query string params,
      // but we don't add it to the params list because we don't use it when calling the API.
      if (this.$route.query.char === 'simplified' || this.$route.query.char === 'traditional') {
        if (this.characterSet === this.$route.query.char) {
        } else {
          this.$root.$data.store.changeCharacterSet(this.$route.query.char)
        }
      }
    },
    getWordHistory () {
      // If either the HSK level or the date range has changed, update the query string parameters
      if (this.$route.query.list !== this.params.list || this.$route.query.dates !== this.params.date_range) {
        this.pushToRouter()
      }
      // call wordHistory component based on dropdown inputs
      return axios
        .get(process.env.VUE_APP_API_URL + 'history?', { params: this.params }
        )
        .then((response) => {
          this.wordHistoryList = response.data[this.params.list].slice().reverse()
        })
    },
    exportCSV () {
      // Create final flattened list of words to export
      let wordHistoryListExport = []

      // set wordHistoryWords to the array inside 'hsklevel6' etc
      let wordHistoryWords = this.wordHistoryList

      // loop through items (dicts) in word list array
      for (var i = 0; i < wordHistoryWords.length; i++) {
        // create empty dict for flattened word dict
        let wordFlattened = {}

        // loop through dict items in Word dict
        for (var wordProperty in wordHistoryWords[i]['Word']) {
          // add items in Word dict to flattened word dict directly
          wordFlattened[wordProperty] = wordHistoryWords[i]['Word'][wordProperty]
        }
        // add other items in Word dict to flattened word dict
        wordFlattened['Date'] = wordHistoryWords[i]['Date']

        // add flattened word dict to final list to export
        wordHistoryListExport.push(wordFlattened)
      }
      // console.log(wordHistoryListExport)

      let worksheet = XLSX.utils.json_to_sheet(wordHistoryListExport, { header: ['Date', 'HSK Level', 'Word', 'Pronunciation', 'Definition'] })
      var newWorkbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'SheetJS')
      XLSX.writeFile(newWorkbook, 'Daily Words ' + this.params.list + '.xlsx')
    }
  }
}
</script>

<style scoped lang="scss">
  .container {
    max-width: 55rem;
    padding: 1rem 15px;
  }

  .card-holder {
    padding: 0;
  }

  .btn-shadow {
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,.075);
  }

  .title-col {
    display: flex;
    align-items: center;
  }

  .title {
    margin-bottom: 0;
  }
</style>
