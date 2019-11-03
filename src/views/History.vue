<template>

  <div id="history">
  <!-- Shows daily word history for the past ~3 months for given HSK level -->
    <small-nav></small-nav>

    <div class="container">
      <div class="row m-3">
        <div class="col">
          <h4>
            Daily words
          </h4>
        </div>
        <div class="col-1">
          <button class="btn btn-outline-secondary" type="button" v-on:click="exportCSV();">Export</button>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row justify-content-center m-3">
        <div class="col-3 p-3">
          <select class="custom-select" v-on:input="getWordHistory()" v-model="params.list">
            <option v-for="(name, key) in levelList" :value="key" v-bind:key="key">
              {{ name }}
            </option>
          </select>
        </div>
        <div class="col-3 p-3">
          <select class="custom-select"  v-on:input="getWordHistory()" v-model="params.date_range">
            <option v-for="(days, key) in dateRange" :value="key" v-bind:key="key">
              {{ days }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row m-3">
        <div class="col card-columns">
          <div class="lists" v-for="(list, id) in wordHistoryLists" :key="id">
            <div class="card-holder" v-for="card in list.slice().reverse()" :key="card['ListId']+card['Date']">
              <word-history-card :card="card"></word-history-card>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<script>
// @ is an alias to /src
import smallNav from '@/components/smallNav.vue'
import wordHistory from '@/components/wordHistory.vue'
import * as XLSX from 'xlsx'

export default {
  name: 'history',
  components: {
    'small-nav': smallNav,
    'word-history-card': wordHistory
  },
  data () {
    return {
      wordHistoryLists: [],
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
          this.wordHistoryLists = response.data
          // console.log(this.wordHistoryLists)
        }
        )
    },
    exportCSV () {
      // Create final flattened list of words to export
      let wordHistoryListExport = []

      // set wordHistoryWords to the array inside 'hsklevel6' etc
      let wordHistoryWords = this.wordHistoryLists[this.params.list]

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

<style lang="scss">
  .card-columns {
    padding: 0;
  }
</style>
