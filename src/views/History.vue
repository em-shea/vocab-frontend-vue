<template>

  <div id="history">
  <!-- Shows daily word history for the past ~3 months for given HSK level -->
    <small-nav></small-nav>

    <div class="container">
      <div class="row m-3">
        <div class="col-lg-3 col-md-3 col-sm-9 col-9 p-2">
          <h4>
            Daily words
          </h4>
        </div>
        <!-- Export button above/to the left of dropdowns on sm. and smaller -->
        <div class="d-block d-md-none col-3 p-2">
          <button class="btn btn-outline-secondary" title="Export currently selected words to Excel." type="button" v-on:click="exportCSV();">Export</button>
        </div>
        <div class="col-lg-3 col-md-3 col-sm-6 p-2">
          <select class="custom-select" v-on:input="getWordHistory()" v-model="params.list">
            <option v-for="(name, key) in levelList" :value="key" v-bind:key="key">
              {{ name }}
            </option>
          </select>
        </div>
        <div class="col-lg-3 col-md-3 col-sm-6 p-2">
          <select class="custom-select"  v-on:input="getWordHistory()" v-model="params.date_range">
            <option v-for="(days, key) in dateRange" :value="key" v-bind:key="key">
              {{ days }}
            </option>
          </select>
        </div>
        <!-- Export button below/to the right of dropdowns on med. and larger -->
        <div class="col-lg-2 col-md-1 d-none d-md-block"></div>
        <div class="col-lg-1 col-md-1 d-none d-md-block p-2">
          <button class="btn btn-outline-secondary" title="Export currently selected words to Excel." type="button" v-on:click="exportCSV();">Export</button>
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

    <custom-footer></custom-footer>

  </div>

</template>

<script>
// @ is an alias to /src
import smallNav from '@/components/smallNav.vue'
import wordHistory from '@/components/wordHistory.vue'
import * as XLSX from 'xlsx'
import customFooter from '@/components/footer.vue'

export default {
  name: 'history',
  components: {
    'small-nav': smallNav,
    'word-history-card': wordHistory,
    'custom-footer': customFooter
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
      }
    }
  },
  mounted () {
    this.getWordHistory()
  },
  methods: {
    getWordHistory () {
      // call wordHistory component based on dropdown inputs
      return axios
        .get('https://api.haohaotiantian.com/history?', { params: this.params }
        )
        .then((response) => {
          this.wordHistoryList = response.data[this.params.list].slice().reverse()
          console.log(this.wordHistoryList)
        }
        )
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
      console.log(wordHistoryListExport)

      let worksheet = XLSX.utils.json_to_sheet(wordHistoryListExport, { header: ['Date', 'HSK Level', 'Word', 'Pronunciation', 'Definition'] })
      var newWorkbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'SheetJS')
      XLSX.writeFile(newWorkbook, 'Daily Words ' + this.params.list + '.xlsx')
    }
  }
}
</script>

<style scoped lang="scss">
  .card-holder {
    padding: 0;
  }
</style>
