<template>

  <div id="quiz-component">
    <div class="overlay" v-if="showMenu" @click="showMenu = !showMenu"></div>
    <div class="container">
      <div class="dropdown quiz-settings-dropdown mt-3">
        <button class="btn btn-light dropdown-toggle" @click="showMenu = !showMenu" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Options
        </button>
      </div>
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
                <input class="form-check-input" type="radio" name="vocabListRadios" id="exampleRadios1" value="option1" checked>
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
              <div v-for="timePeriod in reviewTimePeriods" :key="timePeriod" class="form-check">
                <label class="dropdown-options-label">
                  <input class="form-check-input" type="radio" name="reviewPeriodRadios" id="exampleRadios1" value="option1" checked>
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
            <div class="col-12 px-2 text-center">
              <input type="range" class="range-input" id="rangeInput" v-model="questionRangeSelected" @change="setQuestionRange()" value="0" min="0" max="2" step="1">
            </div>
            <div class="col">
              <div>{{ questionQuantity }} questions</div>
            </div>
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
              <button class="close-options-btn btn btn-secondary float-right mr-4" @click="showMenu = !showMenu">Close</button>
            </div>
            <div class="col new-quiz-btn-col">
              <button type="button" class="btn new-quiz-btn">New quiz</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container main-container" v-if="!displayResults">
      <div class="row m-4">
        <div class="col">
          <p class="quiz-title">
            HSK Level 1, past 14 days
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
          <button type="button" class="btn btn-secondary" @click="nextQuestion()">New quiz</button>
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
      showMenu: true,
      shuffledQuizWords: null,
      selectedQuizWords: null,
      reshuffledQuizWords: null,
      pinyinToggled: false,
      hintOn: false,
      hintsUsed: 0,
      answerSelected: null,
      answerResults: null,
      questionQuantity: 10,
      questionRangeSelected: 0,
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
      reviewTimePeriods: [
        '1 week',
        '2 weeks',
        '1 month'
      ],
      questionQuantityOptions: [
        10,
        20,
        30
      ],
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
    setQuestionRange () {
      this.questionQuantity = this.questionQuantityOptions[this.questionRangeSelected]
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
    padding-top: 2rem;
  }

  .progress-bar {
    background: rgb(255,76,0);
    background: linear-gradient(90deg, rgba(255,76,0,1) 0%, rgba(255,145,0,1) 100%);
  }

  .question-definition-small {
    font-size: 1.1rem;
  }

  .new-quiz-btn, .quiz-answers-button:not(:disabled):not(.disabled).active {
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

  .quiz-settings-dropdown {
    text-align: right;
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
    right: -5%;
    min-height: 45px;
  }

  .dropdown-toggle::after {
    display: none;
  }

  .dropdown-options-label {
    margin-bottom: 0;
  }

  .menu-options-row {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .dropdown-title {
    /* font-weight: bold; */
    font-size: 0.8rem;
  }

  .range-input {
    min-width: 80%;
  }
</style>
