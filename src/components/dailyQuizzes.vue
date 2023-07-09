<template>
  <div class="row">
    <div v-for="item in quizWeekData" :key="item.day_name" class="col px-1 progress-icon-col">
      <div class="card daily-quiz-card shadow-sm" :class="{'day-completed': item['completed'],  'day-missed': item['missed']}">
        <div class="card-body m-2">
          <span class="oi oi-check check-icon" ></span>
          <div class="card-title">
            {{ item.day_name }}
          </div>
          <!-- <div v-if="item['completed']" class="card-text">
            Score {{ item.quizResults }}
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dailyQuizzes',
  props: {
    userQuizzes: Array
  },
  data () {
    return {
      quizWeekData: {
        0: {
            'day_name': '星期日',
            'quizResults': '50%',
            'completed': true,
            'missed': false
          },
        1: {
            'day_name': '星期一',
            'quizResults': '',
            'completed': false,
            'missed': false
        },
        2: {
            'day_name': '星期二',
            'quizResults': '',
            'completed': false,
            'missed': false
          },
        3: {
            'day_name': '星期三',
            'quizResults': '',
            'completed': false,
            'missed': false
        },
        4: {
            'day_name': '星期四',
            'quizResults': '',
            'completed': false,
            'missed': false
        },
        5: {
            'day_name': '星期五',
            'quizResults': '',
            'completed': false,
            'missed': false
          },
        6: {
            'day_name': '星期六',
            'quizResults': '',
            'completed': false,
            'missed': false
        }
      }
    }
  },
  mounted () {
    this.calculateQuizProgress()
  },
  methods: {
    calculateQuizProgress() {
      // Find Sunday, the first day of the week
      let todays_date = new Date()
      let first_date_of_week = todays_date.getDate() - todays_date.getDay() + 1
      let first_day_of_week = new Date(todays_date.setDate(first_date_of_week)).toISOString()
      // console.log(first_day_of_week)

      for (let i =0; i <= 6; i++) {
        // Update this.quizWeekData with user's quiz results from this.userQuizzes
      }
    }
  }
}
</script>

<style scoped>
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
