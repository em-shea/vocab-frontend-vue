<template>
  <div id="quiz-component">
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
              <button class="close-options-btn btn btn-secondary float-right mr-4" @click="showMenu = !showMenu">
                Close
                <span class="oi oi-x oi-icon" title="oi-x"></span>
              </button>
            </div>
            <div class="col new-quiz-btn-col">
              <button type="button" class="btn new-quiz-btn">
                New quiz
                <span class="oi oi-reload oi-icon"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'quizSettings',
  props: {
    showMenu: Boolean,
    vocabLists: Array,
    reviewTimePeriods: Array,
    questionRangeSelected: Number,
    questionQuantity: Number
  },
  components: {},
  data () {
    return {
    }
  },
  computed: {},
  methods: {}
}
</script>
