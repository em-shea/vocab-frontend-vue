<template>
  <div id="user-profile">

    <small-header></small-header>

    <div class="container">
      <div class="row">
        <div class="col">
          <h5>{{ displayName }}</h5>
          <p class="mb-2 text-muted">{{ displayNamePinyin }}</p>
        </div>
      </div>
      <div class="row">
        <div class="col">
          Daily tasks:
        </div>
      </div>
      <div class="row">
        <div class="col-12 text-center">
          <button type="button" class="btn orange-button" v-on:click="$router.push('/my-quizzes');">
            Vocab quiz
          </button>
        </div>
        <div class="col-12 text-center">
          <!-- Issue getting routed to writing practice page -->
          <button type="button" class="btn orange-button" v-on:click="$router.push('/writing-practice');">
            Practice sentences
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col">
          Subscribed lists:
        </div>
      </div>
      <ul>
        <li v-for="list in userLists" :key="list">
          {{ list }}
        </li>
      </ul>
      <div class="row">
        <div class="col">
          <button type="button" class="btn btn-light" v-on:click="$router.push('/my-quizzes');">
            Account settings
          </button>
        </div>
      </div>
    </div>
          <!-- <div class="card mx-auto">
            <div class="card-body">
              <ul class="list-group list-group-flush">
                <li class="list-group-item">Daily tasks</li>

                <li class="list-group-item">Your progress</li>
                https://bootstrap-datepicker.readthedocs.io/en/latest/

            </div>

              <li class="list-group-item">Created lists</li>
              <li class="list-group-item">Quiz scores</li>
            </ul>
            <div class="card-body">
              <a href="#" class="card-link">Profile settings</a>
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <custom-footer></custom-footer>

  </div>

</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'

export default {
  name: 'user-profile',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {
      displayName: '小蔡 🐼',
      displayNamePinyin: 'Xiǎo cài',
      userLists: [
        'HSK Level 3',
        'HSK Level 6'
      ]
    }
  },
  computed: {
    signedIn () {
      return this.$root.$data.store.retrieveSignInStatus()
    }
  },
  mounted () {
    if (!this.signedIn) {
      this.$root.$data.store.storeSessionData(null, null)
      this.$router.push('/signin')
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
  .orange-button {
    cursor: pointer;
    border-radius: .5em;
    background-color: #fe4c00;
    border-color: #fe4c00;
    color: white;
    min-width: 200px;
    margin: .5em;
  }

</style>
