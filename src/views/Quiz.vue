<template>
  <!-- Generates tests for a given timeframe of daily words for a given level -->
  <div id="quiz" class="quiz">
    <small-header></small-header>
    <div class="overlay" v-if="showMenu" @click="hideMenu()"></div>
    <div class="container" v-if="showMenu">
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <div class="container dropdown-menu-container">
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
                <option v-for="list in dedupedvocabListIds" :value="list.list_id" :key="list.list_name">{{ list.list_name }}</option>
              </select>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="row">
            <div class="col-12">
              <label for="reviewPeriodSelect">Review period</label>
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
    <div class="container quiz-title-container">
      <div class="row title-row">
        <div class="col-10 title-col">
          <h5 class="quiz-title">
            <!-- how to look up list name -->
            {{ selectedVocabListName }}, past {{ settingsActive.dateRangeSelected }} days
          </h5>
        </div>
        <div class="col-2">
          <div class="dropdown quiz-settings-dropdown">
            <button class="btn btn-light dropdown-toggle" @click="showMenu = !showMenu;" type="button" id="dropdownMenuButton" aria-haspopup="true" aria-expanded="false">
              <!-- v-tooltip="{
                content: tooltipContent,
                show: isOpen,
                trigger: 'manual',
                placement: 'top',
              }" -->
              <span class="oi oi-pencil oi-icon" title="oi-pencil" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="container quiz-main-container" v-if="!displayResults">
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
              {{ selectedQuizWords[0]['word'][selectedTestSet['question']] }}
              <!-- <div class="question-pinyin mt-2" v-if="pinyinToggled && selectedTestSet['question'] == 'Word'">
                {{ selectedQuizWords[0]['Word']['Pronunciation'] }}
              </div> -->
            </h3>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12 col-lg-6 my-2" v-for="word in reshuffledQuizWords" :key="word['word']['word_id']">
            <div class="btn-group btn-group-toggle btn-block question-answers-form my-1">
              <label class="btn btn-light quiz-answers-button shadow-sm btn-block" :class="[ answerButtonClass(word), getTextClass(selectedTestSet['answers'])]">
                <input v-on:click="submitAnswer(word)" :value="word" type="radio" name="exampleRadios" id="exampleRadios1">
                {{ word['word'][selectedTestSet['answers']] }}
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
        <div class="col-12">
          <button type="button" class="btn btn-light next-button btn-shadow" @click="nextQuestion()">Next</button>
        </div>
      </div>
      <div class="row" v-if="answerResults != null">
        <div class="col text-center">
          <p class="review-cards-link" @click="showReviewCards = !showReviewCards">{{ reviewCardsMessage }}</p>
        </div>
      </div>
      <div v-if="showReviewCards" class="row card-deck">
        <div class="card-holder col-xl-6 col-md-6 col-sm-6" v-for="word in reshuffledQuizWords" :key="word['list_id']+word['date_sent']">
          <review-card :card="word"></review-card>
        </div>
      </div>
    </div>
    <div class="container results-main-container" v-if="displayResults">
      <div class="row">
        <div class="col text-center">
          <h5>Your score:</h5>
          <h5>
            {{ percentCorrect }} ({{ correctAnswers }}/{{ settingsActive.questionQuantity }})
          </h5>
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
import reviewWordCard from '@/components/reviewWordCard.vue'
import vocabListIds from '@/assets/vocabListIds.json'

export default {
  name: 'quiz',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter,
    'review-card': reviewWordCard
  },
  data () {
    return {
      quizWords: [],
      showMenu: false,
      // isOpen: true,
      // tooltipContent: 'Tooltip',
      loadingQuiz: true,
      params: {
        list: '1ebcad3f-5dfd-6bfe-bda4-acde48001122',
        days: '14',
        ques: '10'
      },
      settingsActive: {
        selectedVocabList: '1ebcad3f-5dfd-6bfe-bda4-acde48001122',
        questionQuantity: 10,
        dateRangeSelected: 30
      },
      // temp settings hold quiz setting values before the user submits 'new quiz'
      settingsTemp: {
        selectedVocabList: '1ebcad3f-5dfd-6bfe-bda4-acde48001122',
        questionQuantity: 10,
        dateRangeSelected: 30
      },
      tempCharSet: 'simplified',
      vocabListIds: vocabListIds,
      dateRange: [7, 14, 30],
      questionQuantityOptions: [5, 10, 20],
      selectedQuizWords: null,
      reshuffledQuizWords: null,
      // pinyinToggled: false,
      // hintOn: false,
      // hintsUsed: 0,
      questionList: [],
      selectedTestSet: null,
      activeTestSetList: [],
      testSetList: [
        { 'question': 'simplified',
          'answers': 'definition' },
        { 'question': 'definition',
          'answers': 'simplified' },
        { 'question': 'definition',
          'answers': 'pinyin' },
        { 'question': 'pinyin',
          'answers': 'definition' }
      ],
      questionNumber: 1,
      lastQuestionWord: null,
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
    dedupedvocabListIds () {
      // vocabListIds includes all 12 unique list ids, reducing to 6 generic list ids
      return vocabListIds.filter(list => list.character_set === 'simplified')
    },
    listIdsArray () {
      let array = []
      for (let i = 0; i < this.dedupedvocabListIds.length; i++) {
        array.push(this.dedupedvocabListIds[i]['list_id'])
      }
      return array
    },
    selectedVocabListName () {
      let matchingList = this.dedupedvocabListIds.filter(list => list.list_id === this.settingsActive.selectedVocabList)
      if (matchingList.length === 0) {
        return 'Loading'
      }
      return matchingList[0].list_name
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
    this.getReviewWords().then((response) => {
      this.setQuizWords()
      this.setCharacterSet()
      this.loadingQuiz = false
    })
  },
  methods: {
    checkInitialParams () {
      // Check if acceptable parameters have been passed (list ids, (7,14,30) days, simplified/traditional
      if (this.$route.query.list_id && this.listIdsArray.indexOf(this.$route.query.list_id) !== -1) {
        this.params.list = this.$route.query.list_id
        let convertedParams = this.convertSettingsOrParams(this.params)
        this.settingsTemp.selectedVocabList = convertedParams.selectedVocabList
        this.settingsActive.selectedVocabList = convertedParams.selectedVocabList
      }
      if (this.$route.query.date_range && this.dateRange.indexOf(parseInt(this.$route.query.date_range)) !== -1) {
        this.params.days = this.$route.query.date_range
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
          // currently query params and active settings don't update tempCharSet
        }
      }
    },
    pushToRouter () {
      // new list id passed in router, this function is currently overwriting it with params
      // issue probably in check params above
      if (this.$route.query.list_id !== this.params.list || this.$route.query.date_range !== this.params.days || this.$route.query.ques !== this.params.ques || this.$route.query.char !== this.characterSet) {
        this.$router.push({ query: { 'list_id': this.params.list, 'date_range': this.params.days, 'ques': this.params.ques, 'char': this.characterSet } })
      }
    },
    getReviewWords () {
      return axios
        .get(process.env.VUE_APP_API_URL + 'review?', { params: { 'date_range': this.params.days, 'list_id': this.params.list } }
        )
        .then((response) => {
          let reviewWordsResponse = response.data[this.params.list].slice().reverse()
          let dedupedQuizWords = this.dedupe(reviewWordsResponse)
          this.quizWords = this.shortenDef(dedupedQuizWords)
        })
    },
    setCharacterSet () {
      // possible to simplify this - right now default is simplified and this overwrites it regardless
      if (this.characterSet === 'traditional') {
        for (let i = 0; i < this.testSetList.length; i++) {
          if (this.testSetList[i]['question'] === 'simplified') {
            this.testSetList[i]['question'] = 'traditional'
          }
          if (this.testSetList[i]['answers'] === 'simplified') {
            this.testSetList[i]['answers'] = 'traditional'
          }
        }
      }
      if (this.characterSet === 'simplified') {
        for (let i = 0; i < this.testSetList.length; i++) {
          if (this.testSetList[i]['question'] === 'traditional') {
            this.testSetList[i]['question'] = 'simplified'
          }
          if (this.testSetList[i]['answers'] === 'traditional') {
            this.testSetList[i]['answers'] = 'simplified'
          }
        }
      }
    },
    setQuizWords () {
      this.questionList = []

      // Ensure there are no pinyin/character count mismatches (a one char answer for an obviously two char question):
      // Sort quizWords into three lists: oneChar, twoChar, and all (just the quizWords list).
      // If any list is less than 4 words long (not enough for 4 answer options), drop the list.
      // Randomly select one of the remaining lists.
      // If oneChar or twoChar lists are selected, add word & pronunciation pairs to the question/answer set array (testSetList).

      // TODO: Make random selection weighted on how many words are in each of the oneChar and twoChar lists
      // https://stackoverflow.com/questions/8435183/generate-a-weighted-random-number

      // Create word list data structure
      let oneCharWords = []
      let twoCharWords = []
      let quizWordsListsByCharLength = [
        oneCharWords,
        twoCharWords,
        this.quizWords
      ]

      // Sort words by length
      for (let i = 0; i < this.quizWords.length; i++) {
        if (this.quizWords[i].word.simplified.length < 2) {
          oneCharWords.push(this.quizWords[i])
        }
        if (this.quizWords[i].word.simplified.length === 2) {
          twoCharWords.push(this.quizWords[i])
        }
      }

      // If one of the lists has less than 4 words, don't include it
      for (let i = 0; i < quizWordsListsByCharLength.length; i++) {
        // Why is this only printing list twice when there should be 3 lists?
        if (quizWordsListsByCharLength[i].length < 4) {
          quizWordsListsByCharLength.splice(i, 1)
        }
      }

      // Select at random one of the word lists
      var randomInt = Math.floor(Math.random() * (quizWordsListsByCharLength.length))
      let selectedQuizWordsByCharLength = quizWordsListsByCharLength[randomInt]

      // Shuffle the selected word list and choose the first four words
      let shuffledQuizWords = this.shuffle(selectedQuizWordsByCharLength)
      this.selectedQuizWords = shuffledQuizWords.slice(0, 4)

      // If the first word (the correct answer) is the same as the last question, swap the first and second words
      if (this.lastQuestionWord !== null && this.selectedQuizWords[0] === this.lastQuestionWord) {
        let tempWord = this.selectedQuizWords[0]
        this.selectedQuizWords[0] = this.selectedQuizWords[1]
        this.selectedQuizWords[1] = tempWord
      }
      // Update the last question word selected variable to the current question word selected (for the next time the above code is run)
      this.lastQuestionWord = this.selectedQuizWords[0]

      // Reshuffle the quiz word list so that the first answer is not always the correct one
      this.reshuffledQuizWords = this.shuffle(this.selectedQuizWords)

      this.selectTestSet(selectedQuizWordsByCharLength)
    },
    selectTestSet (selectedQuizWordsByCharLength) {
      this.activeTestSetList = null

      // If the word list with specific char limit was chosen, then add additional question/answer sets
      if (selectedQuizWordsByCharLength !== this.quizWords) {
        let wordPinyinTestSets = [
          // update to char set
          { 'question': 'simplified',
            'answers': 'pinyin' },
          { 'question': 'pinyin',
          // update to char set
            'answers': 'simplified' }
        ]
        this.activeTestSetList = [...this.testSetList, ...wordPinyinTestSets]
      } else {
        // If the word list was not a specific char limit one, then use the basic question/answer set (testSetList)
        this.activeTestSetList = this.testSetList
      }
      var randomInt = Math.floor(Math.random() * this.activeTestSetList.length)
      this.selectedTestSet = this.activeTestSetList[randomInt]
    },
    hideMenu () {
      this.showMenu = !this.showMenu
      // Object assign copies each element of settingsActive to settingsTemp
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
        this.getReviewWords().then((response) => {
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
        let word = inputArray[i]['word']
        uniqueObject[word['word_id']] = inputArray[i]
      }
      for (let i in uniqueObject) {
        dedupedArray.push(uniqueObject[i])
      }
      return dedupedArray
    },
    shortenDef (inputArray) {
      let shortenedDefWords = []
      for (let i in inputArray) {
        let wordDefinition = inputArray[i]['word']['definition']
        if (wordDefinition.length > 80) {
          inputArray[i]['word']['definition'] = wordDefinition.substring(0, 80) + '...'
        }
        shortenedDefWords.push(inputArray[i])
      }
      return shortenedDefWords
    },
    convertSettingsOrParams (value) {
      // convert settings (integers) to URL params (strings) format
      if (value === this.settingsActive || value === this.settingsTemp) {
        let convertedDict = {}
        // convertedDict.list = Object.keys(this.vocabLists).find(key => this.vocabLists[key] === value.selectedVocabList)
        convertedDict.list = value.selectedVocabList
        convertedDict.days = value.dateRangeSelected.toString()
        convertedDict.ques = value.questionQuantity.toString()
        return convertedDict
      }
      // convert URL params (strings) to settings (integers)
      if (value === this.params) {
        let convertedDict = {}
        convertedDict.selectedVocabList = this.listIdsArray[this.listIdsArray.indexOf(value.list)]
        convertedDict.dateRangeSelected = parseInt(value.days)
        convertedDict.questionQuantity = parseInt(value.ques)
        return convertedDict
      }
    },
    getTextClass (value) {
      if (value === 'definition') {
        return 'question-definition-small'
      }
    },
    answerButtonClass (word) {
      let classList = []
      if (word === this.answerSelected && word === this.selectedQuizWords[0]) {
        classList.push('correct-answer-selected')
      }
      if (word === this.answerSelected && word !== this.selectedQuizWords[0]) {
        classList.push('wrong-answer-selected')
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

  .dropdown-toggle {
    margin-bottom: 15px;
  }

  .dropdown-toggle::after {
    display: none;
  }

  .dropdown-menu {
    display: block;
    top: unset;
    border: none;
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
    min-width: 60px;
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
      max-width: 55rem;
      padding: .5rem 15px;
    }

    .dropdown-menu {
      left: 35%;
      right: 35%;
      margin-top: 1rem;
    }
  }

  @media only screen and (min-width: 0px) and (max-width: 500px) {
    .container {
      max-width: 514px;
      padding: .5rem 2.5rem;
    }

    .dropdown-menu {
      left: 5%;
      right: 5%;
    }
  }

  .quiz-main-container {
    padding-bottom: 4em;
  }
</style>
