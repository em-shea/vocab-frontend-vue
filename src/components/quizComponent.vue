<template>
  <div id="quiz-component">
    <div class="container">
      <div class="row mt-4 mb-2">
        <div class="col">
          <h3 class="quiz-question" v-bind:class="{ 'question-definition-small' : selectedTestSet['question'] === 'Definition' }">
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
    quizWords: Array,
    selectedTestSet: Object,
    selectedQuizWords: Array,
    reshuffledQuizWords: Array
  },
  components: {},
  data () {
    return {
      answerResults: null,
      answerSelected: null
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    }
  },
  mounted () {
    console.log(this.selectedQuizWords)
  },
  methods: {
    submitAnswer (word) {
      console.log('submitting answer...', word)
      this.answerSelected = word
      if (this.selectedQuizWords[0] === this.answerSelected) {
        this.answerResults = true
        // this.correctAnswers = this.correctAnswers + 1
      } else {
        this.answerResults = false
      }
      this.emitAnswerResult()
    },
    emitAnswerResult (event) {
      this.$emit('answerSubmitted', this.answerResults)
    }
    // setQuizWords () {
    //   // console.log('set quiz words, ', this.quizWords)
    //   let dedupedQuizWords = this.dedupe(this.quizWords)
    //   let shuffledQuizWords = this.shuffle(dedupedQuizWords)
    //   this.selectedQuizWords = shuffledQuizWords.slice(0, 4)
    //   // reshuffle the quiz word list so that the first answer is not always the correct one
    //   this.reshuffledQuizWords = this.shuffle(this.selectedQuizWords)
    // },
    // selectTestSet () {
    //   var randomInt = Math.floor(Math.random() * Math.floor(this.testSet.length))
    //   this.selectedTestSet = this.testSet[randomInt]
    // },
    // displayHint () {
    //   // incement hint counter
    //   // show hint (can't be untoggled once pressed)
    // },
    // togglePinyin () {
    //   this.pinyinToggled = !this.pinyinToggled
    //   console.log(this.pinyinToggled)
    //   // only show button for certain types of questions?
    // },
    // nextQuestion () {
    //   if (this.questionNumber !== this.totalQuestions) {
    //     this.resetQuestion()
    //     this.questionNumber = this.questionNumber + 1
    //   } else {
    //     this.displayResults = true
    //   }
    // },
    // resetQuestion () {
    //   this.setQuizWords()
    //   this.selectTestSet()
    //   this.pinyinToggled = false
    //   this.hintOn = false
    //   this.answerSelected = null
    //   this.answerResults = null
    // }
  }
}
</script>

<style scoped>
  .container {
    max-width: 514px;
    padding-top: 0.5em;
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
</style>
