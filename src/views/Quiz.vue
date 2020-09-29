<template>
  <!-- Generates tests for a given timeframe of daily words for a given level -->
  <div id="quiz">
    <small-nav></small-nav>
    <div class="overlay" v-if="showMenu" @click="showMenu = !showMenu"></div>
    <div class="dropdown quiz-settings-dropdown mt-3">
      <button class="btn btn-light dropdown-toggle" @click="showMenu = !showMenu" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span class="oi oi-pencil oi-icon" title="oi-pencil" aria-hidden="true"></span>
      </button>
    </div>
    <div class="container">
      <div v-bind:class="{ 'dropdown-menu-visible' : showMenu }" class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <div class="container pt-3">
          <div class="row">
            <div class="col">
              <span class="dropdown-item dropdown-title">Vocab list</span>
            </div>
          </div>
          <div class="row menu-options-row">
            <div v-for="list in vocabLists" :key="list" class="col-6">
              <label class="form-check dropdown-options-label">
                <input v-model="selectedVocabList" :value="list" class="form-check-input" type="radio" name="vocabListRadios" id="exampleRadios1" checked>
                {{ list }}
              </label>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="row">
            <div class="col">
              <span class="dropdown-item dropdown-title">Review period</span>
            </div>
          </div>
          <div class="row menu-options-row">
            <div class="col">
              <div v-for="timePeriod in dateRange" :key="timePeriod" class="form-check">
                <label class="dropdown-options-label">
                  <input v-model="questionRangeSelected" :value="timePeriod" class="form-check-input" type="radio" name="reviewPeriodRadios" id="exampleRadios1" checked>
                  {{ timePeriod }}
                </label>
              </div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="row">
            <div class="col">
              <span class="dropdown-item dropdown-title">Number of questions</span>
            </div>
          </div>
          <div class="row menu-options-row">
            <div class="col">
              <div v-for="quantity in questionQuantityOptions" :key="quantity" class="form-check">
                <label class="dropdown-options-label">
                  <input v-model="questionQuantity" :value="quantity" class="form-check-input" type="radio" name="questionQuantityRadios" id="exampleRadios1" checked>
                  {{ quantity }}
                </label>
              </div>
            </div>
            <!-- <div class="col-12 px-2 text-center">
              <input type="range" class="range-input" id="rangeInput" v-model="questionQuantity" @change="setQuestionRange()" value="0" min="0" max="2" step="1">
            </div>
            <div class="col">
              <div>{{ questionQuantity }} questions</div>
            </div> -->
          </div>
          <div class="dropdown-divider"></div>
          <div class="row">
            <div class="col">
              <span class="dropdown-item dropdown-title">Character set</span>
              <!-- <a class="dropdown-item" href="#">Something else here</a> -->
            </div>
          </div>
          <div class="row menu-options-row">
            <div class="col">
              <div class="form-check">
                <label class="dropdown-options-label">
                  <input class="form-check-input" type="radio" name="charSetRadios" id="exampleRadios1" value="option1" checked>
                  Simplified
                </label>
              </div>
              <div class="form-check">
                <label class="dropdown-options-label">
                  <input class="form-check-input" type="radio" name="charSetRadios" id="exampleRadios1" value="option1" checked>
                  Traditional
                </label>
              </div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="row justify-content-between mt-3 mx-4">
            <div class="col">
              <button class="close-options-btn btn btn-secondary float-right mr-4" @click="showMenu = !showMenu">
                Close
                <span class="oi oi-x oi-icon" title="oi-x"></span>
              </button>
            </div>
            <div class="col new-quiz-btn-col">
              <button type="button" class="btn new-quiz-btn" @click="newQuiz(); showMenu = !showMenu">
                New quiz
                <span class="oi oi-reload oi-icon"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container" v-if="!displayResults">
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
      <!-- <quiz-settings-menu
        :showMenu="showMenu"
        :vocabLists="vocabLists"
        :reviewTimePeriods="reviewTimePeriods"
        :questionRangeSelected="questionRangeSelected"
        :questionQuantity="questionQuantity"
      ></quiz-settings-menu> -->
      <div class="container" v-if="!loadingQuiz">
        <div class="row mt-4 mb-2">
          <div class="col">
            <h3 class="quiz-question" v-bind:class="getTextClass(selectedTestSet['question'])">
              {{ selectedQuizWords[0]['Word'][selectedTestSet['question']] }}
              <!-- <div class="question-pinyin mt-2" v-if="pinyinToggled && selectedTestSet['question'] == 'Word'">
                {{ selectedQuizWords[0]['Word']['Pronunciation'] }}
              </div> -->
            </h3>
          </div>
        </div>
        <div class="row mx-4">
          <div class="col-12 my-2" v-for="word in reshuffledQuizWords" :key="word['Word']['Word']">
            <div class="btn-group btn-group-toggle btn-block question-answers-form my-1">
              <label class="btn btn-light quiz-answers-button shadow-sm btn-block" :class="[ answerButtonClass(word), getTextClass(selectedTestSet['answers'])]">
                <input v-on:click="submitAnswer(word)" :value="word" type="radio" name="exampleRadios" id="exampleRadios1">
                {{ word['Word'][selectedTestSet['answers']] }}
                <!-- <label class="form-check-label pl-1" v-if="pinyinToggled && selectedTestSet['answers'] == 'Word'">
                  {{ word['Pronunciation'] }}
                </label> -->
              </label>
            </div>
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
        <div class="col-6 answer-results">
          <p v-if="answerResults === true && characterSet === 'simplified'">对 👍</p>
          <p v-if="answerResults === true && characterSet === 'traditional'">對 👍</p>
          <p v-if="answerResults === false && characterSet === 'simplified'">不对 👎</p>
          <p v-if="answerResults === false && characterSet === 'traditional'">不對 👎</p>
        </div>
        <div class="col-6 text-center">
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
// @ is an alias to /src
import smallNav from '@/components/smallNav.vue'
// import quizSettings from '@/components/quizSettings.vue'

export default {
  name: 'quiz',
  components: {
    'small-nav': smallNav
    // 'quiz-settings-menu': quizSettings
  },
  data () {
    return {
      loadingQuiz: true,
      quizWords: [],
      params: {
        list: 'HSKLevel1',
        date_range: 30
      },
      selectedVocabList: 'HSK Level 1',
      vocabLists: {
        HSKLevel1: 'HSK Level 1',
        HSKLevel2: 'HSK Level 2',
        HSKLevel3: 'HSK Level 3',
        HSKLevel4: 'HSK Level 4',
        HSKLevel5: 'HSK Level 5',
        HSKLevel6: 'HSK Level 6'
        // Chengyu1: 'Chengyu 1',
        // Chengyu2: 'Chengyu 2',
      },
      questionRangeSelected: 7,
      dateRange: { 7: '1 week', 14: '2 weeks', 30: '1 month' },
      reviewTimePeriods: [
        '1 week',
        '2 weeks',
        '1 month'
      ],
      showMenu: false,
      selectedQuizWords: null,
      reshuffledQuizWords: null,
      // pinyinToggled: false,
      // hintOn: false,
      // hintsUsed: 0,
      questionNumber: 1,
      totalQuestions: 3,
      answerSelected: null,
      answerResults: null,
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
      questionQuantity: 10,
      questionQuantityOptions: [
        10,
        20,
        30
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
  watch: {
    characterSet: function () {
      this.pushToRouter()
    }
  },
  mounted: function () {
    this.loadingQuiz = true
    this.checkInitialParams()
    this.getWordHistory().then((response) => {
      this.setQuizWords()
      this.selectTestSet()
      this.setCharacterSet()
      this.loadingQuiz = false
    })
  },
  methods: {
    checkInitialParams () {
      // Check if acceptable parameters have been passed (HSK 1-6, (7,14,30) days, simplified/traditional)
      if (this.$route.query.list in this.vocabLists) {
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
      this.selectedVocabList = this.vocabLists[this.params.list]
    },
    pushToRouter () {
      if (this.$route.query.list !== this.params.list || this.$route.query.dates !== this.params.date_range || this.$route.query.char !== this.characterSet) {
        this.$router.push({ query: { 'list': this.params.list, 'dates': this.params.date_range, 'char': this.characterSet } })
        console.log('pushToRouter()', this.params.list, this.params.date_range, this.characterSet)
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
        })
    },
    // setQuestionRange () {
    //   this.questionQuantity = this.questionQuantityOptions[this.questionRangeSelected]
    // },
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
    submitAnswer (word) {
      if (this.answerResults != null) {
        return
      }
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
      // this.pinyinToggled = false
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
    },
    getTextClass (value) {
      console.log('get class', value)
      if (value === 'Definition') {
        return 'question-definition-small'
      }
    },
    answerButtonClass (word) {
      let classList = []
      if (word === this.answerSelected) {
        classList.push('active')
      }
      // if (this.answerSelected) {
      //   classList.push('disabled')
      // }
      if (this.answerSelected && word !== this.selectedQuizWords[0]) {
        classList.push('grayed')
      }
      if (word !== this.answerSelected && word === this.selectedQuizWords) {
        classList.push('highlight-correct-answer')
      }
      return classList
    }
  }
}
</script>

<style lang="scss">
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

  .progress-bar {
    background: rgb(255,76,0);
    background: linear-gradient(90deg, rgba(255,76,0,1) 0%, rgba(255,145,0,1) 100%);
  }

  .quiz-title {
    font-size: 1.4em;
    text-align: center;
    /* font-weight: bold; */
  }

  .container {
    max-width: 514px;
    padding-top: 0.5em;
  }

  .quiz-question.question-definition-small, .quiz-answers-button.question-definition-small {
    font-size: 1.4em;
  }

  .new-quiz-btn, .quiz-answers-button:not(:disabled):not(.disabled).active {
    background-color: orangered;
    border-color: orangered;
    color: white;
  }

  .quiz-answers-button.disabled.grayed {
    background-color: #e9ecef;
    border-color: #e9ecef;
  }

  .quiz-answers-button.disabled.highlight-correct-answer {
    background-color: #ff8f00;
    border-color: #ff8f00;
    color: white;
  }

  .quiz-title, .quiz-question, .question-number {
    text-align: center;
  }

  .quiz-question {
    margin-bottom: 0.6em;
    font-weight: 400;
    font-size: 2.5em;
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
    font-weight: 400;
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

  .dropdown-toggle {
    position: absolute;
    right: 4%;
    min-height: 45px;
  }

  .dropdown-toggle::after {
    display: none;
  }

  // dropdown menu
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

  // Desktop
  @media only screen and (min-width: 500px) and (max-width: 2000px) {
  }

  // Mobile
  @media only screen and (min-width: 0px) and (max-width: 500px) {

  }
</style>
