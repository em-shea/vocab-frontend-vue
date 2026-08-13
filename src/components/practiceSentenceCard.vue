<template>
    <div class="card shadow-sm text-center">
        <div class="card-body daily-word-card-body">
            <div class="row">
                <div class="col">
                    <h5 v-if="this.characterSet === 'simplified'" class="card-text">{{ review_word.word.simplified }}</h5>
                    <h5 v-if="this.characterSet === 'traditional'" class="card-text">{{ review_word.word.traditional }}</h5>
                    <p class="card-text">{{ review_word.word.pinyin }} <span @click="playAudio(review_word.word.audio_file_key)" class="oi oi-volume-high audio-icon"></span></p>
                </div>
                <div class="col-1">
                    <span class="oi oi-check header-icon"></span>
                </div>
                <div class="col-6">
                    <input type="sentence" class="form-control" placeholder="Placeholder text">
                </div>
                <div class="col">
                    <button type="button" class="btn orange-button save-btn">Save</button>
                </div>
            </div>
            <!-- <p class="card-text truncate">{{ word.word.definition }}</p> -->
            <!-- <ul class="list-group list-group-flush"> -->
            <!-- <li class="list-group-item text-muted">HSK Level {{ word.word.hsk_level }}, {{ word.CharacterSet }}</li> -->
            <!-- </ul>
            <div class="row justify-content-between">
                <div class="col">
                    <p class="card-link daily-word-link float-left" @click="$router.push({ path: 'quiz', query: {list_id: word.list_id, date_range: 14, ques: 10, char: word.CharacterSet}})">Quiz</p>
                </div>
                <div class="col">
                    <p class="card-link daily-word-link float-right" @click="$router.push({ path: 'review', query: {list_id: word.list_id, date_range: 30, char: word.CharacterSet}})">Review</p>
                </div>
            </div> -->
        </div>
    </div>
</template>

<script>
export default {
  name: 'practiceSentenceCard',
  props: {
    review_word: Object
  },
  data () {
    return {
      clicked: false
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    }
  },
  methods: {
    clickDescription () {
      if (this.clicked === false) {
        this.clicked = true
      } else {
        this.clicked = false
      }
    },
    playAudio (audioFile) {
      let audio = new Audio(audioFile)
      audio.play()
    },
    getDateFormat (cardDate) {
      cardDate = cardDate.split('-')
      let day = cardDate[1]
      let month = cardDate[2]
      let formattedDate = month.concat('/', day)
      return formattedDate
      // https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
    }
  }
}
</script>

<style scoped>
  .card {
    border-radius: 1rem;
    margin: 0.75rem 0rem;
    border: none;
  }
  .card-body {
    padding: 1em;
  }

</style>
