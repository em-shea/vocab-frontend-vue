<template>

  <div id="quiz-component">
    <div class="container" v-if="!displayResults">
      <div class="row m-3">
        <div class="col">
          <p class="quiz-title">
            HSK Level 1, past 14 days
          </p>
          <p class="question-number">
            {{ questionNumber }} of {{ totalQuestions }}, {{ percentCompletion }}
          </p>
          <div class="progress">
            <div class="progress-bar" role="progressbar" style="width: 10%"></div>
          </div>
        </div>
      </div>
      <div class="row mt-4 mb-2">
        <div class="col">
          <h3 class="quiz-question" v-bind:class="{ 'question-definition-small' : selectedTestSet['question'] === 'Definition' }">
            {{ selectedQuizWords[0][selectedTestSet['question']] }}
            <div class="question-pinyin mt-2" v-if="pinyinToggled && selectedTestSet['question'] == 'Word'">
              {{ selectedQuizWords[0]['Pronunciation'] }}
            </div>
          </h3>
        </div>
      </div>
      <div class="row">
        <div class="col-12 my-2" v-for="word in reshuffledQuizWords" :key="word['Word']+word['HSK Level']">
          <div class="btn-group btn-group-toggle btn-block question-answers-form my-1">
            <label class="btn btn-light quiz-answers-button btn-block" :class="{ active : word === answerSelected }">
              <input v-model="answerSelected" type="radio" name="exampleRadios" id="exampleRadios1" :value="word" v-on:change="submitAnswer(word)">
              {{ word[selectedTestSet['answers']] }}
              <!-- <label class="form-check-label pl-1" v-if="pinyinToggled && selectedTestSet['answers'] == 'Word'">
                {{ word['Pronunciation'] }}
              </label> -->
            </label>
          </div>
        </div>
      </div>
      Correct: {{ correctAnswers }}
      <div v-if="answerResults === null" class="row justify-content-between mt-2">
        <div class="col-3">
          <button type="button" class="btn btn-block btn-secondary" @click="displayHint()">Hint</button>
        </div>
        <div class="col-3">
          <button type="button" class="btn btn-block btn-secondary" @click="togglePinyin()">Pinyin</button>
        </div>
      </div>
      <div v-if="answerResults != null" class="row my-3 mx-3">
        <div class="col-12 answer-results">
          <p v-if="answerResults === true">对 👍</p>
        </div>
        <div class="col-12 answer-results">
          <p v-if="answerResults === false">不对 👎</p>
        </div>
        <div class="col-12 text-center">
          <button type="button" class="btn btn-secondary" @click="nextQuestion()">Next</button>
        </div>
      </div>
    </div>
    <div class="container" v-if="displayResults">
      <div class="row">
        <div class="col text-center my-5">
          <h5>Your score:</h5>
          <p>
            {{ percentCorrect }} ({{ correctAnswers }}/{{ totalQuestions }})
          </p>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
// Hint option (calculate hints used)
// Pinyin 'on' button
// Submit button
// Show traditional characters
// Save progress across questions

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
      pinyinToggled: false,
      hintOn: false,
      hintsUsed: 0,
      answerSelected: null,
      answerResults: null,
      questionNumber: 1,
      totalQuestions: 5,
      correctAnswers: 0,
      displayResults: false,
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
  computed: {
    percentCompletion () {
      let decimalValue = this.questionNumber / this.totalQuestions
      let percentValue = (decimalValue * 100).toFixed(0) + '%'
      return percentValue
    },
    percentCorrect () {
      let decimalValue = this.correctAnswers / this.totalQuestions
      let percentValue = (decimalValue * 100).toFixed(0) + '%'
      return percentValue
    }
  },
  mounted () {
    this.setQuizWords()
    this.selectTestSet()
    console.log(this.displayResults)
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
    displayHint () {
      // increment hint counter
      // show hint (can't be untoggled once pressed)
    },
    togglePinyin () {
      this.pinyinToggled = !this.pinyinToggled
      console.log(this.pinyinToggled)
      // only show button for certain types of questions?
    },
    submitAnswer (word) {
      console.log('submitting answer...', word)
      this.answerSelected = word
      if (this.selectedQuizWords[0] === this.answerSelected) {
        this.answerResults = true
        // console.log('correct..', this.correctAnswers)
        this.correctAnswers = this.correctAnswers + 1
        // console.log('correct plus 1..', this.correctAnswers)
      } else {
        this.answerResults = false
      }
    },
    nextQuestion () {
      if (this.questionNumber !== this.totalQuestions) {
        this.setQuizWords()
        this.selectTestSet()
        this.pinyinToggled = false
        this.hintOn = false
        this.answerSelected = null
        this.answerResults = null
        this.questionNumber = this.questionNumber + 1
      } else {
        this.displayResults = true
      }
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
  .container {
    max-width: 514px;
  }

  .progress-bar {
    background: rgb(255,76,0);
    background: linear-gradient(90deg, rgba(255,76,0,1) 0%, rgba(255,145,0,1) 100%);
  }

  .question-definition-small {
    font-size: 1.1rem;
  }

  .quiz-answers-button:not(:disabled):not(.disabled).active {
    background-color: orangered;
    border-color: orangered;
    color: white;
  }

  .quiz-title, .quiz-question, .question-number {
    text-align: center;
  }

  .question-number {
    font-size: 80%;
    margin-bottom: 0;
  }

  .question-pinyin {
    font-size: 70%;
  }

  .quiz-answers-button{
    cursor: pointer;
  }

  .answer-results {
    text-align: center;
  }
</style>
