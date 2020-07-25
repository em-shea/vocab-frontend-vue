<template>

  <!-- Generates tests for a given timeframe of daily words for a given level -->
  <div id="quiz">
    <small-nav></small-nav>
    <quiz-component :quizWords="quizWords"></quiz-component>
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
      cards: [],
      page: 0,
      quizWords: [
        {
          'Word': '老师',
          'Pronunciation': 'lǎo shī',
          'Definition': 'teacher; CL:個|个[ge4],位[wei4]',
          'HSK Level': '1',
          'Word-Traditional': '老師'
        },
        {
          'Word': '二',
          'Pronunciation': 'èr',
          'Definition': 'two; 2; stupid (Beijing dialect)',
          'HSK Level': '1',
          'Word-Traditional': '二'
        },
        {
          'Word': '认识',
          'Pronunciation': 'rèn shi',
          'Definition': 'to know; to recognize; to be familiar with; acquainted with sth; knowledge; understanding; awareness; cognition',
          'HSK Level': '1',
          'Word-Traditional': '認識'
        },
        {
          'Word': '是',
          'Pronunciation': 'shì',
          'Definition': 'is; are; am; yes; to be',
          'HSK Level': '1',
          'Word-Traditional': '是'
        },
        {
          'Word': '菜',
          'Pronunciation': 'cài',
          'Definition': 'dish (type of food); vegetables; vegetable; cuisine; CL:盤|盘[pan2],道[dao4]',
          'HSK Level': '1',
          'Word-Traditional': '菜'
        },
        {
          'Word': '字',
          'Pronunciation': 'zì',
          'Definition': 'letter; symbol; character; word; CL:個|个[ge4]; courtesy or style name traditionally given to males aged 20 in dynastic China',
          'HSK Level': '1',
          'Word-Traditional': '字'
        },
        {
          'Word': '七',
          'Pronunciation': 'qī',
          'Definition': 'seven; 7',
          'HSK Level': '1',
          'Word-Traditional': '七'
        },
        {
          'Word': '吃',
          'Pronunciation': 'chī',
          'Definition': "to eat; to have one's meal; to eradicate; to destroy; to absorb; to suffer; to exhaust",
          'HSK Level': '1',
          'Word-Traditional': '吃'
        },
        {
          'Word': '了',
          'Pronunciation': 'le',
          'Definition': '(modal particle intensifying preceding clause); (completed action marker)',
          'HSK Level': '1',
          'Word-Traditional': '了'
        }
      ]
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    }
  },
  mounted () {
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
