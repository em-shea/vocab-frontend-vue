<template>

  <!-- Generates tests for a given timeframe of daily words for a given level -->
  <div id="quiz">
    <small-nav></small-nav>
    Quizzes
  </div>
</template>

<script>
// @ is an alias to /src
import smallNav from '@/components/smallNav.vue'

export default {
  name: 'quiz',
  components: {
    'small-nav': smallNav
  },
  data () {
    return {
      cards: [],
      page: 0
    }
  },
  mounted () {
    // this.pullSets().then(() => {
    //   this.setInitialParams()
    //   if (this.nameSelected) {
    //     this.searchByName(this.$route.query.name)
    //   } else {
    //     this.pullCards(this.params.set.id, this.params.color.id)
    //   }
    // })
  },
  methods: {
    // Call wordHistory component based on level query string parameters, set initial query string parameters to level 1 if none provided
    // Generate multiple choice tests - Pull word data (pronunciation, definition) for ~4 other words to create other options.
    // Keep running tally of score
  }
}
</script>

<style lang="scss">
</style>
