<template>

  <div id="quiz-component">
    <div class="container">
      <div class="row m-3">
        <div class="col">
          <p class="quiz-title">
            HSK Level 4, past 14 days
          </p>
          <small class="question-number">
            1 of 10
          </small>
          <div class="progress">
            <div class="progress-bar" role="progressbar" style="width: 50%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
      </div>
      <div class="row mt-4 mb-2">
        <div class="col">
          <h3 class="quiz-question">
            {{ selectedQuizWords[0][selectedTestSet['question']] }}
          </h3>
        </div>
      </div>
      <div class="row m-1">
        <div v-for="word in reshuffledQuizWords" :key="word['Word']+word['HSK Level']">
          <div class="col-12 m-1">
            <div class="form-check">
              <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="option1" checked>
              <label class="form-check-label" for="exampleRadios1">
                {{ word[selectedTestSet['answers']] }}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">

        </div>
      </div>
    </div>
  </div>

</template>

<script>
// Hint option (calculate hints used)
// Pinyin 'on' button

export default {
  name: 'quizComponent',
  props: {
    quizWords: Array
  },
  components: {
  },
  data () {
    return {
      shuffledQuizWords: null,
      selectedQuizWords: null,
      reshuffledQuizWords: null,
      testSet: [
        { 'question': 'Word',
          'answers': 'Pronunciation' },
        { 'question': 'Pronunciation',
          'answers': 'Word' },
        { 'question': 'Word',
          'answers': 'Definition' },
        { 'question': 'Definition',
          'answers': 'Word' },
        { 'question': 'Word',
          'answers': 'Pronunciation' },
        { 'question': 'Pronunciation',
          'answers': 'Word' }
      ],
      selectedTestSet: null
    }
  },
  mounted () {
    this.setQuizWords()
    this.selectTestSet()
  },
  methods: {
    setQuizWords () {
      this.shuffledQuizWords = this.shuffle(this.quizWords)
      this.selectedQuizWords = this.shuffledQuizWords.slice(0, 4)
      this.reshuffledQuizWords = this.shuffle(this.selectedQuizWords)
    },
    selectTestSet () {
      var randomInt = Math.floor(Math.random() * Math.floor(this.testSet.length))
      this.selectedTestSet = this.testSet[randomInt]
      console.log(this.selectedTestSet)
    },
    shuffle (inputArray) {
      // Make copy of inputArray since shuffle passes the input by reference
      var array = [...inputArray]
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }
  }
}
</script>

<style scoped>
  .progress-bar{
    background: rgb(255,76,0);
    background: linear-gradient(90deg, rgba(255,76,0,1) 0%, rgba(255,145,0,1) 100%);
  }

  .quiz-title, .quiz-question, .question-number {
    text-align: center;
  }
</style>
