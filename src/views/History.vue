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
          <button class="btn btn-outline-secondary" type="button" onclick="return submitSub();">Export</button>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row justify-content-center m-3">
        <div class="col-3 p-3">
          <select class="custom-select" id="level">
            <option selected>HSK level</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
        </div>
        <div class="col-3 p-3">
          <select class="custom-select" id="level">
            <option selected>Time range (days)</option>
            <option value="1">30</option>
            <option value="2">60</option>
            <option value="3">90</option>
          </select>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row m-3">
        <div class="col card-columns">
          <div class="lists" v-for="list in wordHistoryLists" :key="list['ListId']">
            <div class="card-holder" v-for="card in list.reverse()" :key="card['Word']['Word']">
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

export default {
  name: 'history',
  components: {
    'small-nav': smallNav,
    'word-history-card': wordHistory
  },
  data () {
    return {
      wordHistoryLists: [],
      page: 0
    }
  },
  mounted () {
    this.getWordHistory()
  },
  methods: {
    getWordHistory () {
    // call wordHistory component based on level query string parameters, set initial query string parameters to level 1 if none provided
    // Display words as cards in chronological order
    // Button to export list as CSV
      return axios
        .get('https://api.haohaotiantian.com/history', {}
        )
        .then((response) => {
          this.wordHistoryLists = response.data
          console.log(this.wordHistoryLists)
        }
        // On load, calls my sample words API that returns example words for given level
        // Within HTML, pass sample words to exampleWords component to be rendered
        )
    }
  }
}
</script>

<style lang="scss">
  .card-columns {
    padding: 0;
  }
</style>
