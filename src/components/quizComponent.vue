<template>
  <div id="quiz-component">
    <div class="overlay" v-if="showMenu" @click="showMenu = !showMenu"></div>
    <div class="dropdown quiz-settings-dropdown mt-3">
      <button class="btn btn-light dropdown-toggle" @click="showMenu = !showMenu" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span class="oi oi-pencil oi-icon" title="oi-pencil" aria-hidden="true"></span>
      </button>
    </div>
    <quiz-settings-menu
      :showMenu="showMenu"
      :vocabLists="vocabLists"
      :reviewTimePeriods="reviewTimePeriods"
      :questionRangeSelected="questionRangeSelected"
      :questionQuantity="questionQuantity"
    ></quiz-settings-menu>
    <div class="container main-container" v-if="!displayResults">
      <div class="row m-4">
        <div class="col">
          <p class="quiz-title">
            {{ selectedVocabList }}, past {{ questionRangeSelected }} days
          </p>
          <p class="question-number">
            {{ questionNumber }} of {{ totalQuestions }}, {{ percentCompletion }}
          </p>
          <div class="progress">
            <div class="progress-bar" role="progressbar" :style="{width: percentCompletion}"></div>
          </div>
        </div>
      </div>
      <div class="row mt-4 mb-2">
        <div class="col">
          <h3 class="quiz-question" v-bind:class="{ 'question-definition-small' : selectedTestSet['question'] === 'Definition' }">
            {{ selectedQuizWords[0]['Word'][selectedTestSet['question']] }}
            <div class="question-pinyin mt-2" v-if="pinyinToggled && selectedTestSet['question'] == 'Word'">
              {{ selectedQuizWords[0]['Word']['Pronunciation'] }}
            </div>
          </h3>
        </div>
      </div>
      <div class="row mx-4">
        <div class="col-12 my-2" v-for="word in reshuffledQuizWords" :key="word['Word']['Word']">
          <div class="btn-group btn-group-toggle btn-block question-answers-form my-1">
            <label class="btn btn-light quiz-answers-button shadow-sm btn-block" :class="{ active : word === answerSelected }">
              <input v-model="answerSelected" type="radio" name="exampleRadios" id="exampleRadios1" :value="word" v-on:change="submitAnswer(word)">
              {{ word['Word'][selectedTestSet['answers']] }}
              <!-- <label class="form-check-label pl-1" v-if="pinyinToggled && selectedTestSet['answers'] == 'Word'">
                {{ word['Pronunciation'] }}
              </label> -->
            </label>
          </div>
        </div>
      </div>
      <!-- <div v-if="answerResults === null" class="row justify-content-between mt-2">
        <div class="col-3">
          <button type="button" class="btn btn-block btn-secondary" @click="displayHint()">Hint</button>
        </div>
        <div class="col-3">
          <button type="button" class="btn btn-block btn-secondary" @click="togglePinyin()">Pinyin</button>
        </div>
      </div> -->
      <div v-if="answerResults != null" class="row my-3 mx-3">
        <div class="col-12 answer-results">
          <p v-if="answerResults === true && characterSet === 'simplified'">对 👍</p>
          <p v-if="answerResults === true && characterSet === 'traditional'">對 👍</p>
        </div>
        <div class="col-12 answer-results">
          <p v-if="answerResults === false && characterSet === 'simplified'">不对 👎</p>
          <p v-if="answerResults === false && characterSet === 'traditional'">不對 👎</p>
        </div>
        <div class="col-12 text-center">
          <button type="button" class="btn btn-secondary" @click="nextQuestion()">Next</button>
        </div>
      </div>
    </div>
    <div class="container main-container" v-if="displayResults">
      <div class="row mt-5">
        <div class="col text-center">
          <h5>Your score:</h5>
          <p>
            {{ percentCorrect }} ({{ correctAnswers }}/{{ totalQuestions }})
          </p>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col text-center">
          <button type="button" class="btn btn-secondary" @click="newQuiz()">New quiz</button>
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

import quizSettings from '@/components/quizSettings.vue'

export default {
  name: 'quizComponent',
  props: {
    quizWords: Array
  },
  components: {
    'quiz-settings-menu': quizSettings
  },
  data () {
    return {
      showMenu: false,
      selectedQuizWords: null,
      reshuffledQuizWords: null,
      pinyinToggled: false,
      hintOn: false,
      hintsUsed: 0,
      answerSelected: null,
      answerResults: null,
      questionNumber: 1,
      totalQuestions: 3,
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
      selectedTestSet: null,
      questionRangeSelected: 7,
      reviewTimePeriods: [
        '1 week',
        '2 weeks',
        '1 month'
      ],
      questionQuantity: 10,
      questionQuantityOptions: [
        10,
        20,
        30
      ],
      selectedVocabList: 'HSK Level 1',
      vocabLists: [
        'HSK Level 1',
        'HSK Level 2',
        'HSK Level 3',
        'HSK Level 4',
        'HSK Level 5',
        'HSK Level 6'
        // 'Chengyu 1',
        // 'Chengyu 2',
        // 'Chengyu 3'
      ]
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    },
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
    this.setCharacterSet()
  },
  methods: {
    setQuizWords () {
      // console.log('set quiz words, ', this.quizWords)
      let dedupedQuizWords = this.dedupe(this.quizWords)
      let shuffledQuizWords = this.shuffle(dedupedQuizWords)
      this.selectedQuizWords = shuffledQuizWords.slice(0, 4)
      // reshuffle the quiz word list so that the first answer is not always the correct one
      this.reshuffledQuizWords = this.shuffle(this.selectedQuizWords)
    },
    selectTestSet () {
      var randomInt = Math.floor(Math.random() * Math.floor(this.testSet.length))
      this.selectedTestSet = this.testSet[randomInt]
    },
    setCharacterSet () {
      if (this.characterSet === 'traditional') {
        for (let i = 0; i < this.testSet.length; i++) {
          if (this.testSet[i]['question'] === 'Word') {
            this.testSet[i]['question'] = 'Word-Traditional'
          }
          if (this.testSet[i]['answers'] === 'Word') {
            this.testSet[i]['answers'] = 'Word-Traditional'
          }
        }
      }
    },
    displayHint () {
      // incement hint counter
      // show hint (can't be untoggled once pressed)
    },
    togglePinyin () {
      this.pinyinToggled = !this.pinyinToggled
      console.log(this.pinyinToggled)
      // only show button for certain types of questions?
    },
    setQuestionRange () {
      this.questionQuantity = this.questionQuantityOptions[this.questionRangeSelected]
    },
    submitAnswer (word) {
      console.log('submitting answer...', word)
      this.answerSelected = word
      if (this.selectedQuizWords[0] === this.answerSelected) {
        this.answerResults = true
        this.correctAnswers = this.correctAnswers + 1
      } else {
        this.answerResults = false
      }
    },
    nextQuestion () {
      if (this.questionNumber !== this.totalQuestions) {
        this.resetQuestion()
        this.questionNumber = this.questionNumber + 1
      } else {
        this.displayResults = true
      }
    },
    newQuiz () {
      this.resetQuestion()
      this.displayResults = false
      this.questionNumber = 1
      this.correctAnswers = 0
    },
    resetQuestion () {
      this.setQuizWords()
      this.selectTestSet()
      this.pinyinToggled = false
      this.hintOn = false
      this.answerSelected = null
      this.answerResults = null
    },
    shuffle (inputArray) {
      // Make copy of inputArray since shuffle passes the input by reference
      var array = [...inputArray]
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
      return array
    },
    dedupe (inputArray) {
      let dedupedArray = []
      let uniqueObject = {}
      for (let i in inputArray) {
        let word = inputArray[i]['Word']['Word']
        uniqueObject[word] = inputArray[i]
      }
      for (let i in uniqueObject) {
        dedupedArray.push(uniqueObject[i])
      }
      return dedupedArray
    }
  }
}
</script>

<style scoped>

  .overlay {
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
    background-color: gray;
    opacity: 0.33;
    z-index: 20;
  }

  .container {
    max-width: 514px;
  }

  .main-container {
    padding-top: 0.5em;
  }

  .progress-bar {
    background: rgb(255,76,0);
    background: linear-gradient(90deg, rgba(255,76,0,1) 0%, rgba(255,145,0,1) 100%);
  }

  .question-definition-small {
    font-size: 1.1em;
  }

  .new-quiz-btn, .quiz-answers-button:not(:disabled):not(.disabled).active {
    background-color: orangered;
    border-color: orangered;
    color: white;
  }

  .quiz-title, .quiz-question, .question-number {
    text-align: center;
  }

  .quiz-question {
    margin-top: 0.6em;
    margin-bottom: 0.6em;
    font-size: 2.5em;
  }

  .quiz-title {
    font-size: 1.4em;
    /* font-weight: bold; */
  }

  .question-number {
    margin-bottom: 0;
  }

  .question-pinyin {
    font-size: 0.7em;
  }

  .quiz-answers-button{
    cursor: pointer;
    font-size: 1.6em;
    border-radius: .5em;
  }

  .answer-results {
    text-align: center;
  }

  .quiz-settings-dropdown {
    text-align: right;
  }

  .oi-icon {
    font-size: 15px;
  }

  .dropdown-menu {
    display: block;
    width: 100%;
    bottom: -550px;
    left: unset;
    right: 0;
    top: unset;
    transition: bottom, 1s;
    border: none;
    border-bottom-left-radius: 0%;
    border-bottom-right-radius: 0%;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
  }

  .dropdown-menu-visible {
    display: block;
    bottom: 0px;
    transition: bottom, 1s;
  }

  .dropdown-toggle {
    position: absolute;
    right: 0.5%;
    min-height: 45px;
  }

  .dropdown-toggle::after {
    display: none;
  }

  .dropdown-options-label {
    margin-bottom: 0;
  }

  .menu-options-row {
    padding-left: 1.5em;
    padding-right: 1.5em;
  }

  .dropdown-title {
    /* font-weight: bold; */
    font-size: 0.8em;
  }

  .range-input {
    min-width: 80%;
  }
</style>
