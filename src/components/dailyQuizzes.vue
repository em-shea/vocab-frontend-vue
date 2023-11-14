<template>
  <div class="row">
      <div class="col text-center">
        <div class="card shadow-sm">
          <div class="card-body">
              <div v-if="!todaysQuizStatus">
                加油！<br>
                <router-link :to="{ name: 'quiz'}">Click here to take a daily quiz</router-link>
              </div>
              <div v-if="todaysQuizStatus">很棒！<br>Today's quiz completed</div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div v-for="item in quizWeekData" :key="item.day_name" class="col px-1 progress-icon-col">
      <div class="card daily-quiz-card shadow-sm" :class="{'day-completed': item['completed'],  'day-missed': item['missed']}">
        <div class="card-body m-2">
          <span class="oi oi-check check-icon" ></span>
          <div class="card-title">
            {{ item.day_name }}
          </div>
          <div v-if="item['completed']" class="card-text">
            Score {{ item.quizResults }}
          </div>
        </div>
      </div>
    </div> -->
</template>

<script>
export default {
  name: 'dailyQuizzes',
  props: {
    userQuizzes: Object
  },
  data () {
    return {
      // todaysQuizStatus: false
      // quizWeekData: []
    }
  },
  computed: {
    todaysQuizStatus () {
      // console.log('quiz: ', this.userQuizzes)
      // If no past quizzes
      if (this.userQuizzes.data.length == 0) {
        return false
      } else {
        let lastQuizDate = new Date(this.userQuizzes.data[this.userQuizzes.data.length-1].date_created)
        let todaysDate = new Date()
        // console.log(lastQuizDate.toISOString().split('T')[0])
        // console.log(todaysDate.toISOString().split('T')[0])
        if (lastQuizDate.toISOString().split('T')[0] == todaysDate.toISOString().split('T')[0]) {
          return true
        } else {
          return false
        }
      }
    }
  },
  mounted () {},
  methods: {
    calculateQuizProgress() {
      // TODO - Show quiz progress for a given week
      // Find Sunday, the first day of the week
      let todaysDate = new Date()
      let firstDateOfWeek = todaysDate.getDate() - todaysDate.getDay() + 1
      let firstDayOfWeek = new Date(todaysDate.setDate(firstDateOfWeek)).toISOString()
      // console.log(firstDateOfWeek)
      // console.log(firstDayOfWeek)
      // Set days of week in this.quizWeekData
      // Update this.quizWeekData with user's quiz results from this.userQuizzes
      console.log(this.quizWeekData)
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
  .daily-quiz-card {
    text-align: center;
    border: none;
  }
  .daily-quiz-card .card-title {
    margin-bottom: 0;
  }
  .check-icon {
    font-size: 50px;
    color: white;
  }
  .week-day-icon {
    font-size: 80px;
    line-height: inherit;
    opacity: 20%;
  }
  .day-completed {
    color: white;
    background: linear-gradient(90deg, #ff4c00 0%, #ff9100 100%);
    /* background: -webkit-linear-gradient(#ff4c00, #ff9100);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent; */
    opacity: 100%;
  }
</style>
