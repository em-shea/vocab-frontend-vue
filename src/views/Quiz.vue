<template>
  <!-- Generates tests for a given timeframe of daily words for a given level -->
  <div id="quiz">
    <small-nav></small-nav>
    <!-- Reference quiz settings here? -->
    <!-- Move javascript here so that data can be sent as props to quizcomponent and quizsettings -->
    <quiz-component v-if="dataLoaded" :quizWords="quizWords"></quiz-component>
  </div>
</template>

<script>
// @ is an alias to /src
import smallNav from '@/components/smallNav.vue'
import quizComponent from '@/components/quizComponent.vue'

export default {
  name: 'quiz',
  components: {
    'small-nav': smallNav,
    'quiz-component': quizComponent
  },
  data () {
    return {
      dataLoaded: false,
      params: {
        list: 'HSKLevel5',
        date_range: 14
      },
      levelList: { HSKLevel1: 'HSK Level 1', HSKLevel2: 'HSK Level 2', HSKLevel3: 'HSK Level 3', HSKLevel4: 'HSK Level 4', HSKLevel5: 'HSK Level 5', HSKLevel6: 'HSK Level 6' },
      dateRange: { 7: '1 week', 14: '2 weeks', 30: '1 month' },
      quizWords: []
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    }
  },
  watch: {
    characterSet: function () {
      this.pushToRouter()
    }
  },
  mounted: function () {
    this.checkInitialParams()
    this.getWordHistory()
  },
  methods: {
    pushToRouter () {
      if (this.$route.query.list !== this.params.list || this.$route.query.dates !== this.params.date_range || this.$route.query.char !== this.characterSet) {
        this.$router.push({ query: { 'list': this.params.list, 'dates': this.params.date_range, 'char': this.characterSet } })
        console.log('pushToRouter()', this.params.list, this.params.date_range, this.characterSet)
      }
    },
    checkInitialParams () {
      // Check if acceptable parameters have been passed (HSK 1-6, (7,14,30) days, simplified/traditional)
      if (this.$route.query.list in this.levelList) {
        this.params.list = this.$route.query.list
      }
      if (this.$route.query.dates in this.dateRange) {
        this.params.date_range = this.$route.query.dates
      }
      if (this.$route.query.char === 'simplified' || this.$route.query.char === 'traditional') {
        if (this.characterSet === this.$route.query.char) {
        } else {
          this.$root.$data.store.changeCharacterSet(this.$route.query.char)
        }
      }
    },
    getWordHistory () {
      // If either the HSK level or the date range has changed, update the query string parameters
      // if (this.$route.query.list !== this.params.list || this.$route.query.dates !== this.params.date_range) {
      //   this.pushToRouter()
      // }
      // call wordHistory component based on dropdown inputs
      return axios
        .get(process.env.VUE_APP_API_URL + 'history?', { params: this.params }
        )
        .then((response) => {
          this.quizWords = response.data[this.params.list].slice().reverse()
          this.dataLoaded = true
        })
    }
  }
}
</script>

<style lang="scss">

</style>
