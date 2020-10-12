<template>
  <!-- Generates tests for a given timeframe of daily words for a given level -->
  <div id="quiz" class="quiz">
    <small-header></small-header>
    <!-- <nav-bar v-if="mobileDevice === false"></nav-bar> -->
    <div class="overlay" v-if="showMenu" @click="hideMenu()"></div>
    <div class="container" v-if="showMenu">
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <div class="container dropdown-menu-container">
          <!-- <div class="row menu-options-row">
            <div v-for="list in vocabLists" :key="list" class="col-6">
              <label class="form-check dropdown-options-label">
                <input v-model="selectedVocabList" :value="list" class="form-check-input" type="radio" name="vocabListRadios" id="exampleRadios1" checked>
                {{ list }}
              </label>
            </div>
          </div> -->
          <div class="row">
            <div class="col">
              <h5 class="quiz-settings-title pb-2 ">Quiz settings</h5>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <label for="listSelect">Vocab list</label>
            </div>
            <div class="col-12 mb-3">
              <select v-model="settingsTemp.selectedVocabList" class="form-control" id="listSelect">
                <option v-for="list in vocabLists" :key="list">{{ list }}</option>
              </select>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="row">
            <div class="col-12">
              <label for="reviewPeriodSelect">Review period</label>
              <!-- figure out how to vind to selected value -->
            </div>
            <div class="col-12 mb-3 text-center">
              <div class="btn-group" role="group" id="reviewPeriodSelect" aria-label="Basic example">
                <button
                  v-for="days in dateRange"
                  :key="days"
                  @click="settingsTemp.dateRangeSelected = days"
                  :class="{ active : days === settingsTemp.dateRangeSelected }"
                  type="button"
                  class="btn btn-light btn-group-wide"
                  >
                    {{ days }} days
                </button>
              </div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="row">
            <div class="col-12">
              <!-- figure out how to vind to selected value -->
              <label for="questionQuantitySelect">Number of questions</label>
            </div>
            <div class="col-12 mb-3 text-center">
              <div class="btn-group" role="group" id="questionQuantitySelect" aria-label="Basic example">
                <button
                  v-for="quantity in questionQuantityOptions"
                  :key="quantity"
                  @click="settingsTemp.questionQuantity = quantity"
                  :class="{ active : quantity === settingsTemp.questionQuantity }"
                  type="button"
                  class="btn btn-light btn-group-mid"
                >
                  {{ quantity }}
                </button>
              </div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="row">
            <div class="col-12">
              <label for="characterSetSelect">Character Set</label>
            </div>
            <div class="col-12 mb-2 text-center">
              <!-- figure out how to vind to selected value -->
              <div class="btn-group" role="group" id="characterSetSelect" aria-label="Basic example">
                <button
                  type="button"
                  class="btn btn-light btn-group-wide"
                  :class='{"active": tempCharSet === "simplified"}'
                  @click="tempCharSet = 'simplified'"
                >
                  Simplified
                </button>
                <button
                  type="button"
                  class="btn btn-light btn-group-wide"
                  :class='{"active": tempCharSet === "traditional"}'
                  @click="tempCharSet = 'traditional'"
                >
                  Traditional
                </button>
              </div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="row justify-content-between mt-3">
            <div class="col">
              <button class="close-options-btn btn btn-light btn-shadow" @click="hideMenu()">
                Close
                <span class="oi oi-x oi-icon menu-icon" title="oi-x"></span>
              </button>
            </div>
            <div class="col new-quiz-btn-col">
              <button type="button" class="btn btn-shadow new-quiz-btn" @click="newQuiz('newSettings'); showMenu = !showMenu">
                New quiz
                <span class="oi oi-reload oi-icon menu-icon"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container quiz-main-container">
      <div class="row title-row">
        <div class="col-10 title-col">
          <h5 class="quiz-title">
            {{ settingsActive.selectedVocabList }}, past {{ settingsActive.dateRangeSelected }} days
          </h5>
        </div>
        <div class="col-2">
          <div class="dropdown quiz-settings-dropdown">
            <button class="btn btn-light dropdown-toggle" @click="showMenu = !showMenu;" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span class="oi oi-pencil oi-icon" title="oi-pencil" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="container" v-if="!displayResults">
      <div class="row">
        <div class="col">
          <div class="progress">
            <span class="progress-bar-text" :class="percentOver50()"> {{ questionNumber }} / {{ settingsActive.questionQuantity }} </span>
            <div class="progress-bar" role="progressbar" :style="{width: percentCompletion}"></div>
          </div>
        </div>
      </div>
      <div v-if="!loadingQuiz">
        <div class="row mt-4 mb-3">
          <div class="col">
            <h3 class="quiz-question m-0" v-bind:class="getTextClass(selectedTestSet['question'])">
              {{ selectedQuizWords[0]['Word'][selectedTestSet['question']] }}
              <!-- <div class="question-pinyin mt-2" v-if="pinyinToggled && selectedTestSet['question'] == 'Word'">
                {{ selectedQuizWords[0]['Word']['Pronunciation'] }}
              </div> -->
            </h3>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12 col-lg-6 my-2" v-for="word in reshuffledQuizWords" :key="word['Word']['Word']">
            <div class="btn-group btn-group-toggle btn-block question-answers-form my-1">
              <label class="btn btn-light quiz-answers-button shadow-sm btn-block" :class="[ answerButtonClass(word), getTextClass(selectedTestSet['answers'])]">
                <input v-on:click="submitAnswer(word)" :value="word" type="radio" name="exampleRadios" id="exampleRadios1">
                {{ word['Word'][selectedTestSet['answers']] }}
                <i v-if="answerSelected && word === selectedQuizWords[0]" class="fa fa-check-circle pl-2"></i>
                <i v-if="answerSelected && word === answerSelected && word !== selectedQuizWords[0]" class="fa fa-times-circle pl-2"></i>
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
      <div v-if="answerResults != null" class="row my-3">
        <!-- <div class="col-6 answer-results">
          <p v-if="answerResults === true && characterSet === 'simplified'">对 </p>
          <p v-if="answerResults === true && characterSet === 'traditional'">對 <i class="fa fa-check-circle"></i></p>
          <p v-if="answerResults === false && characterSet === 'simplified'">不对 <i class="fa fa-times-circle"></i></p>
          <p v-if="answerResults === false && characterSet === 'traditional'">不對 <i class="fa fa-times-circle"></i></p>
        </div> -->
        <div class="col-12">
          <button type="button" class="btn btn-light next-button btn-shadow" @click="nextQuestion()">Next</button>
        </div>
      </div>
      <div v-if="answerResults != null" class="row">
        <div class="col text-center">
          <p class="review-cards-link" @click="showReviewCards = !showReviewCards">{{ reviewCardsMessage }}</p>
        </div>
      </div>
      <div v-if="showReviewCards" class="row card-deck">
        <div class="card-holder col-xl-6 col-md-6 col-sm-6" v-for="word in reshuffledQuizWords" :key="word['ListId']+word['Date']">
          <review-card :card="word"></review-card>
        </div>
      </div>
    </div>
    <div class="container results-main-container" v-if="displayResults">
      <div class="row">
        <div class="col text-center">
          <h5>Your score:</h5>
          <p>
            {{ percentCorrect }} ({{ correctAnswers }}/{{ settingsActive.questionQuantity }})
          </p>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col text-center">
          <button type="button" class="btn btn-light btn-shadow" @click="newQuiz('sameSettings')">New quiz</button>
        </div>
      </div>
    </div>
    <custom-footer :footerWidth="footerWidth"></custom-footer>
  </div>
</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'
import wordHistory from '@/components/wordHistory.vue'

export default {
  name: 'quiz',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter,
    'review-card': wordHistory
  },
  data () {
    return {
      quizWords: [],
      showMenu: false,
      loadingQuiz: true,
      params: {
        list: 'HSKLevel1',
        days: '7',
        ques: '10'
      },
      settingsActive: {
        selectedVocabList: 'HSK Level 1',
        questionQuantity: 10,
        dateRangeSelected: 7
      },
      settingsTemp: {
        selectedVocabList: 'HSK Level 1',
        questionQuantity: 10,
        dateRangeSelected: 7
      },
      tempCharSet: 'simplified',
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
      dateRange: [7, 14, 30],
      questionQuantityOptions: [5, 10, 20, 30],
      selectedQuizWords: null,
      reshuffledQuizWords: null,
      // pinyinToggled: false,
      // hintOn: false,
      // hintsUsed: 0,
      selectedTestSet: null,
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
      questionNumber: 1,
      answerSelected: null,
      answerResults: null,
      correctAnswers: 0,
      displayResults: false,
      showReviewCards: false,
      footerWidth: 'narrow'
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    },
    mobileDevice () {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    },
    percentCompletion () {
      let decimalValue = this.questionNumber / this.settingsActive.questionQuantity
      let percentValue = (decimalValue * 100).toFixed(0) + '%'
      return percentValue
    },
    percentCorrect () {
      let decimalValue = this.correctAnswers / this.settingsActive.questionQuantity
      let percentValue = (decimalValue * 100).toFixed(0) + '%'
      return percentValue
    },
    reviewCardsMessage () {
      if (this.showReviewCards) {
        return 'Hide word definitions'
      } else {
        return 'Show word definitions'
      }
    }
  },
  watch: {
  },
  mounted: function () {
    this.loadingQuiz = true
    this.checkInitialParams()
    this.pushToRouter()
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
      if (this.$route.query.list && this.$route.query.list in this.vocabLists) {
        this.params.list = this.$route.query.list
        let convertedParams = this.convertSettingsOrParams(this.params)
        this.settingsTemp.selectedVocabList = convertedParams.selectedVocabList
        this.settingsActive.selectedVocabList = convertedParams.selectedVocabList
      }
      if (this.$route.query.days && this.dateRange.indexOf(parseInt(this.$route.query.days)) !== -1) {
        this.params.days = this.$route.query.days
        let convertedParams = this.convertSettingsOrParams(this.params)
        this.settingsTemp.dateRangeSelected = convertedParams.dateRangeSelected
        this.settingsActive.dateRangeSelected = convertedParams.dateRangeSelected
      }
      if (this.$route.query.ques && this.questionQuantityOptions.indexOf(parseInt(this.$route.query.ques)) !== -1) {
        this.params.ques = this.$route.query.ques
        let convertedParams = this.convertSettingsOrParams(this.params)
        this.settingsTemp.questionQuantity = convertedParams.questionQuantity
        this.settingsActive.questionQuantity = convertedParams.questionQuantity
      }
      if (this.$route.query.char === 'simplified' || this.$route.query.char === 'traditional') {
        if (this.characterSet !== this.$route.query.char) {
          this.$root.$data.store.changeCharacterSet(this.$route.query.char)
        }
      }
    },
    pushToRouter () {
      if (this.$route.query.list !== this.params.list || this.$route.query.days !== this.params.days || this.$route.query.ques !== this.params.ques || this.$route.query.char !== this.characterSet) {
        this.$router.push({ query: { 'list': this.params.list, 'days': this.params.days, 'ques': this.params.ques, 'char': this.characterSet } })
        // console.log('if changed... pushToRouter()', this.params.list, this.params.days, this.params.ques, this.characterSet)
      }
    },
    getWordHistory () {
      return axios
        .get(process.env.VUE_APP_API_URL + 'history?', { params: { 'date_range': this.params.days, 'list': this.params.list } }
        )
        .then((response) => {
          let wordHistoryResponse = response.data[this.params.list].slice().reverse()
          let dedupedQuizWords = this.dedupe(wordHistoryResponse)
          this.quizWords = this.shortenDef(dedupedQuizWords)
        })
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
      if (this.characterSet === 'simplified') {
        for (let i = 0; i < this.testSet.length; i++) {
          if (this.testSet[i]['question'] === 'Word-Traditional') {
            this.testSet[i]['question'] = 'Word'
          }
          if (this.testSet[i]['answers'] === 'Word-Traditional') {
            this.testSet[i]['answers'] = 'Word'
          }
        }
      }
    },
    setQuizWords () {
      let shuffledQuizWords = this.shuffle(this.quizWords)
      this.selectedQuizWords = shuffledQuizWords.slice(0, 4)
      // reshuffle the quiz word list so that the first answer is not always the correct one
      this.reshuffledQuizWords = this.shuffle(this.selectedQuizWords)
    },
    selectTestSet () {
      var randomInt = Math.floor(Math.random() * Math.floor(this.testSet.length))
      this.selectedTestSet = this.testSet[randomInt]
    },
    hideMenu () {
      this.showMenu = !this.showMenu
      // object assign copies each element of settingsActive to settingsTemp
      Object.assign(this.settingsTemp, this.settingsActive)
      this.tempCharSet = this.$root.$data.store.state.characterSet
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
      if (this.questionNumber !== this.settingsActive.questionQuantity) {
        this.resetQuestion()
        this.questionNumber = this.questionNumber + 1
      } else {
        this.displayResults = true
      }
    },
    newQuiz (value) {
      if (value === 'newSettings') {
        Object.assign(this.settingsActive, this.settingsTemp)
        this.$root.$data.store.changeCharacterSet(this.tempCharSet)
        this.params = this.convertSettingsOrParams(this.settingsTemp)
        this.pushToRouter()
        this.setCharacterSet()
        this.getWordHistory().then((response) => {
          this.resetQuestion()
        })
      } else {
        this.resetQuestion()
      }
      this.displayResults = false
      this.questionNumber = 1
      this.correctAnswers = 0
    },
    resetQuestion () {
      this.setQuizWords()
      this.selectTestSet()
      // this.pinyinToggled = false
      // this.hintOn = false
      this.answerSelected = null
      this.answerResults = null
      this.showReviewCards = false
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
    shortenDef (inputArray) {
      let shortenedDefWords = []
      for (let i in inputArray) {
        let wordDefinition = inputArray[i]['Word']['Definition']
        if (wordDefinition.length > 80) {
          inputArray[i]['Word']['Definition'] = wordDefinition.substring(0, 80) + '...'
        }
        shortenedDefWords.push(inputArray[i])
      }
      return shortenedDefWords
    },
    convertSettingsOrParams (value) {
      if (value === this.settingsActive || value === this.settingsTemp) {
        let convertedDict = {}
        convertedDict.list = Object.keys(this.vocabLists).find(key => this.vocabLists[key] === value.selectedVocabList)
        convertedDict.days = value.dateRangeSelected.toString()
        convertedDict.ques = value.questionQuantity.toString()
        return convertedDict
      }
      if (value === this.params) {
        let convertedDict = {}
        convertedDict.selectedVocabList = this.vocabLists[value.list]
        convertedDict.dateRangeSelected = parseInt(value.days)
        convertedDict.questionQuantity = parseInt(value.ques)
        return convertedDict
      }
    },
    getTextClass (value) {
      if (value === 'Definition') {
        return 'question-definition-small'
      }
    },
    answerButtonClass (word) {
      let classList = []
      if (word === this.answerSelected && word === this.selectedQuizWords[0]) {
        console.log('pushing correct')
        classList.push('correct-answer-selected')
      }
      if (word === this.answerSelected && word !== this.selectedQuizWords[0]) {
        console.log('pushing wrong')
        classList.push('wrong-answer-selected')
      }
      if (this.answerSelected !== null && word !== this.answerSelected && word === this.selectedQuizWords[0]) {
        console.log('pushing highlight')
        classList.push('highlight-correct-answer')
      }
      return classList
    },
    percentOver50 () {
      let percentInt = parseFloat(this.percentCompletion) / 100.0
      if (percentInt > 0.5) {
        return 'progress-bar-text-white'
      }
    }
  }
}
</script>

<style scoped>
  .quiz {
    min-height: 100vh;
  }

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

  .progress-bar-text {
    position: absolute;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    text-align: center;
  }

  .progress-bar-text-white {
    color: white;
  }

  .quiz-question.question-definition-small {
    font-size: 1.5em;
  }

  .quiz-answers-button.question-definition-small {
    font-size: 1em;
  }

  .quiz-answers-button {
    align-items: center;
    display: flex;
    min-height: 60px;
    justify-content: center;
  }

  .next-button {
    min-width: 100px;
    float: right;
  }

  .new-quiz-btn {
    background-color: #fe4c00;
    border-color: #fe4c00;
    color: white;
  }

  /* .quiz-answers-button:not(:disabled):not(.disabled).active {
    background-color: #fe4c00;
    border-color: #fe4c00;
    color: white;
  } */

  .new-quiz-btn:hover {
    color: white;
    background-color: #cc3600;
    border-color: #cc3600;
  }

  .quiz-answers-button {
    transition: none;
  }

  .quiz-answers-button.correct-answer-selected, .btn-light:not(:disabled):not(.disabled):active.quiz-answers-button.correct-answer-selected {
    background-color: #fe4c00;
    border-color: #fe4c00;
    color: white;
  }

    .quiz-answers-button.wrong-answer-selected, .btn-light:not(:disabled):not(.disabled):active.quiz-answers-button.wrong-answer-selected {
    background-color: #6c757d;
    border-color: #6c757d;
    color: white;
  }

  .quiz-answers-button.highlight-correct-answer, .btn-light:not(:disabled):not(.disabled):active.quiz-answers-button.highlight-correct-answer {
    /* border: orangered 3px solid; */
    background-color: #fe4c00;
    border-color: #fe4c00;
    color: white;
  }

  .quiz-question, .question-number {
    text-align: center;
  }

  .quiz-question {
    /* margin-bottom: 0.6em; */
    font-weight: 400;
    font-size: 2em;
  }

  .question-number {
    margin-bottom: 0;
  }

  .question-pinyin {
    font-size: 0.7em;
  }

  .quiz-answers-button{
    cursor: pointer;
    font-size: 1.2em;
    font-weight: 400;
    border-radius: .5em;
  }

  .btn-shadow {
    box-shadow: 0 .125rem .25rem rgba(0,0,0,.075);
  }

  .answer-results {
    text-align: left;
    padding-left: 4rem;
  }

  .quiz-settings-dropdown {
    text-align: right;
  }

  .quiz-settings-title {
    color: orange;
  }

  .oi-icon {
    font-size: 13px;
  }

  .title-row {
    padding: 1em 0 0 0;
  }

  .title-col {
    display: flex;
    align-items: center;
  }

  /* .dropdown-toggle {
    z-index: 5;
    position: absolute;
    min-height: 45px;
    margin-top: 7px;
  } */

  .dropdown-toggle {
    margin-bottom: 15px;
  }

  .dropdown-toggle::after {
    display: none;
  }

  .dropdown-menu {
    display: block;
    top: unset;
    /* bottom: -550px; */
    /* transition: bottom, 1s; */
    border: none;
    /* border-bottom-left-radius: 15px; */
    /* border-bottom-right-radius: 15px; */
    /* border-top-left-radius: 15px; */
    /* border-top-right-radius: 15px; */
  }

  .dropdown-menu-container {
    padding-left: 1.5em;
    padding-right: 1.5em;
    padding-bottom: 0.5em;
  }

  .dropdown-menu-visible {
    display: block;
    bottom: 0px;
    transition: bottom, 1s;
  }

  .menu-options-row {
    padding-left: 1.5em;
    padding-right: 1.5em;
  }

  .btn-group-wide {
    min-width: 75px;
  }

  .btn-group-mid {
    min-width: 50px;
  }

  .menu-icon {
    padding-left: 5px;
  }

  .new-quiz-btn {
    min-width: 120px;
    margin-right: 0;
    float: right;
  }

  .close-options-btn {
    min-width: 100px;
    margin-right: 0;
    float: left;
  }

  .dropdown-title {
    /* font-weight: bold; */
    font-size: 0.8em;
  }

  .range-input {
    min-width: 80%;
  }

  .results-main-container {
    margin-top: 5rem;
  }

  .review-cards-link {
    color: orangered;
    font-size: 0.9rem;
    padding-top: 1rem;
  }

  .review-cards-link:hover {
    cursor: pointer;
  }

  .card-holder {
    padding: 0;
  }

  @media only screen and (min-width: 500px) and (max-width: 2000px) {
    .container {
      max-width: 880px;
    }

    .quiz-main-container {
      max-width: 880px;
      padding: 1rem 2.5rem;
    }

    /* .dropdown-toggle {
      right: 20.5rem;
    } */

    .dropdown-menu {
      left: 35%;
      right: 35%;
      margin-top: 1rem;
    }
  }

  @media only screen and (min-width: 0px) and (max-width: 500px) {
    .container {
      max-width: 514px;
      padding: 1rem 2.5rem;
    }

    /* .dropdown-toggle {
      right: 11%;
    } */

    .dropdown-menu {
      left: 5%;
      right: 5%;
    }
  }
</style>
