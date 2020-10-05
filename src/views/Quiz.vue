<template>
  <!-- Generates tests for a given timeframe of daily words for a given level -->
  <div id="quiz">
    <small-nav></small-nav>
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
                  class="btn btn-light btn-group-wide"
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
              <button class="close-options-btn btn btn-light btn-shadow mr-4" @click="hideMenu()">
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
    <div class="dropdown quiz-settings-dropdown">
      <button class="btn btn-light dropdown-toggle" @click="showMenu = !showMenu;" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span class="oi oi-pencil oi-icon" title="oi-pencil" aria-hidden="true"></span>
      </button>
    </div>
    <div class="container quiz-main-container" v-if="!displayResults">
      <div class="row mt-2 mx-4">
        <div class="col">
          <p class="quiz-title">
            {{ settingsActive.selectedVocabList }}, past {{ settingsActive.dateRangeSelected }} days
          </p>
          <!-- <p class="question-number">
            {{ questionNumber }} of {{ questionQuantity }}, {{ percentCompletion }}
          </p> -->
          <div class="progress">
            <span class="progress-bar-text" :class="percentOver50()"> {{ questionNumber }} / {{ settingsActive.questionQuantity }} </span>
            <div class="progress-bar" role="progressbar" :style="{width: percentCompletion}"></div>
          </div>
        </div>
      </div>
      <div v-if="!loadingQuiz">
        <div class="row mx-4 mt-4 mb-3">
          <div class="col">
            <h3 class="quiz-question m-0" v-bind:class="getTextClass(selectedTestSet['question'])">
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
      <div v-if="answerResults != null" class="row my-3 mx-4">
        <div class="col-6 answer-results">
          <p v-if="answerResults === true && characterSet === 'simplified'">对 👍</p>
          <p v-if="answerResults === true && characterSet === 'traditional'">對 👍</p>
          <p v-if="answerResults === false && characterSet === 'simplified'">不对 👎</p>
          <p v-if="answerResults === false && characterSet === 'traditional'">不對 👎</p>
        </div>
        <div class="col-6 text-right">
          <button type="button" class="btn btn-light next-button btn-shadow" @click="nextQuestion()">Next</button>
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
  </div>
</template>

<script>
import smallNav from '@/components/smallNav.vue'

export default {
  name: 'quiz',
  components: {
    'small-nav': smallNav
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
      displayResults: false
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
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
    }
  },
  watch: {
    // settingsActive: function () {
    //   this.pushToRouter()
    // },
    // characterSet: function () {
    //   this.pushToRouter()
    // }
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
        console.log('update list')
        this.params.list = this.$route.query.list
        let convertedParams = this.convertSettingsOrParams(this.params)
        this.settingsTemp.selectedVocabList = convertedParams.selectedVocabList
        this.settingsActive.selectedVocabList = convertedParams.selectedVocabList
      }
      if (this.$route.query.days && this.dateRange.indexOf(parseInt(this.$route.query.days)) !== -1) {
        console.log('update days')
        this.params.days = this.$route.query.days
        let convertedParams = this.convertSettingsOrParams(this.params)
        this.settingsTemp.dateRangeSelected = convertedParams.dateRangeSelected
        this.settingsActive.dateRangeSelected = convertedParams.dateRangeSelected
      }
      if (this.$route.query.ques && this.questionQuantityOptions.indexOf(parseInt(this.$route.query.ques)) !== -1) {
        console.log('update ques')
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
      console.log('pushToRouter...')
      if (this.$route.query.list !== this.params.list || this.$route.query.days !== this.params.days || this.$route.query.ques !== this.params.ques || this.$route.query.char !== this.characterSet) {
        this.$router.push({ query: { 'list': this.params.list, 'days': this.params.days, 'ques': this.params.ques, 'char': this.characterSet } })
        console.log('if changed... pushToRouter()', this.params.list, this.params.days, this.params.ques, this.characterSet)
      }
    },
    getWordHistory () {
      // If either the HSK level or the date range has changed, update the query string parameters
      // if (this.$route.query.list !== this.params.list || this.$route.query.days !== this.params.days || this.$route.query.ques !== this.params.ques) {
      //   console.log('get word history, params dont match', this.params)
      //   console.log('route: ', this.$route.query)
      //   this.pushToRouter()
      // }
      // call wordHistory component based on dropdown inputs
      return axios
        .get(process.env.VUE_APP_API_URL + 'history?', { params: this.params }
        )
        .then((response) => {
          let wordHistoryResponse = response.data[this.params.list].slice().reverse()
          // this.quizWords = response.data[this.params.list].slice().reverse()
          let dedupedQuizWords = this.dedupe(wordHistoryResponse)
          this.quizWords = this.shortenDef(dedupedQuizWords)
        })
    },
    // setQuestionRange () {
    //   this.questionQuantity = this.questionQuantityOptions[this.dateRangeSelected]
    // },
    setCharacterSet () {
      console.log('setting char set...', this.characterSet)
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
      console.log(this.settingsTemp.selectedVocabList)
      // object assign copies each element of settingsActive to settingsTemp
      Object.assign(this.settingsTemp, this.settingsActive)
      // does this need to also use object assign or something similar?
      this.tempCharSet = this.$root.$data.store.state.characterSet
      console.log(this.settingsTemp.selectedVocabList)
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
        // console.log('new quiz - temp settings', this.settingsTemp.selectedVocabList)
        Object.assign(this.settingsActive, this.settingsTemp)
        this.$root.$data.store.changeCharacterSet(this.tempCharSet)
        this.params = this.convertSettingsOrParams(this.settingsTemp)
        this.pushToRouter()
        this.setCharacterSet()
        console.log('new quiz char set', this.$root.$data.store.state.characterSet)
        // console.log('new quiz - active settings', this.settingsActive.selectedVocabList)
      }
      this.resetQuestion()
      this.displayResults = false
      this.questionNumber = 1
      this.correctAnswers = 0
    },
    resetQuestion () {
      console.log('reset ques', this.characterSet)
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
      // console.log('get class', value)
      if (value === 'Definition') {
        return 'question-definition-small'
      }
    },
    answerButtonClass (word) {
      let classList = []
      if (word === this.answerSelected) {
        classList.push('active')
      }
      if (this.answerSelected && word !== this.selectedQuizWords[0]) {
        classList.push('grayed')
      }
      if (this.answerSelected !== null && word !== this.answerSelected && word === this.selectedQuizWords[0]) {
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

  .quiz-title {
    margin-top: 15px;
    font-size: 1em;
    text-align: center;
    /* font-weight: bold; */
  }

  .container {
    padding-top: 0.5em;
  }

  .quiz-question.question-definition-small {
    font-size: 1.5em;
  }

  .quiz-answers-button.question-definition-small {
    font-size: 1em;
  }

  .next-button {
    min-width: 100px;
  }

  .new-quiz-btn, .quiz-answers-button:not(:disabled):not(.disabled).active {
    background-color: #fe4c00;
    border-color: #fe4c00;
    color: white;
  }

  .new-quiz-btn:hover {
    color: white;
    background-color: #cc3600;
    border-color: #cc3600;
  }

  // .quiz-answers-button.grayed {
  //   background-color: #e9ecef;
  //   border-color: #e9ecef;
  // }

  .quiz-answers-button.highlight-correct-answer {
    border: orangered 3px solid;
  }

  .quiz-title, .quiz-question, .question-number {
    text-align: center;
  }

  .quiz-question {
    // margin-bottom: 0.6em;
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

  .dropdown-toggle {
    z-index: 5;
    position: absolute;
    min-height: 45px;
    margin-top: 7px;
  }

  .dropdown-toggle::after {
    display: none;
  }

  .dropdown-menu {
    display: block;
    top: unset;
    // bottom: -550px;
    // transition: bottom, 1s;
    border: none;
    // border-bottom-left-radius: 15px;
    // border-bottom-right-radius: 15px;
    // border-top-left-radius: 15px;
    // border-top-right-radius: 15px;
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
    margin-top: 8rem;
  }

  // Desktop
  @media only screen and (min-width: 500px) and (max-width: 2000px) {
    .container {
      max-width: 960px;
    }

    .quiz-main-container {
      max-width: 750px;
    }

    .dropdown-toggle {
      right: 28%;
    }

    .dropdown-menu {
      left: 35%;
      right: 35%;
      margin-top: 1rem;
    }
  }

  // Mobile
  @media only screen and (min-width: 0px) and (max-width: 500px) {
    .container {
      max-width: 514px;
    }

    .dropdown-toggle {
      right: 4%;
    }

    .dropdown-menu {
      left: 5%;
      right: 5%;
    }
  }
</style>
