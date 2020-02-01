<template>

  <!-- Page for users to unsubscribe to one or all lists -->
  <div id="unsub">

    <small-nav></small-nav>

    <div class="container">

      <div class="row m-3">
        <div class="col-12">
          <p class="unsubscribe-header">Select an HSK level to unsubscribe from, or unsubscribe from all Haohaotiantian emails.</p>
        </div>
      </div>

      <div class="row m-3 bg-light">
        <div class="col-md-4 col-xs-4 p-3">
          <div class="input-group">
            <input type="email" v-model="params.email" class="form-control" id="subscribe" value="" placeholder="Email address" aria-label="Email address" aria-describedby="button-addon2">
          </div>
        </div>
        <div class="col-md-4 col-xs-3 p-3">
          <select v-model="params.level" :disabled="unsubscribeAllInput" class="custom-select" id="level">
            <option selected value="default">Choose an HSK Level</option>
            <option value="1">HSK Level 1</option>
            <option value="2">HSK Level 2</option>
            <option value="3">HSK Level 3</option>
            <option value="4">HSK Level 4</option>
            <option value="5">HSK Level 5</option>
            <option value="6">HSK Level 6</option>
          </select>
        </div>
        <div class="form-check pull-right form-check-inline col-md-2 col-xs-2 p-3">
          <input type="checkbox" v-model="unsubscribeAllInput" class="form-check-input" id="exampleCheck1">
          <label class="form-check-label pl-1" for="exampleCheck1">Unsubscribe all</label>
        </div>
        <div class="col-md-1 col-xs-2 p-3">
          <button class="btn btn-outline-secondary" type="button" id="button-addon2" v-on:click="submitUnsubscribe();">Unsubscribe</button>
        </div>
      </div>
      <div class="row m-3">
        <div class="col text-center sub-response" id="sub-response">
          <div v-if="unsubscribeResponse === false">
            <p>Something went wrong. Try refreshing the page, or let us know at contact@haohaotiantian.com.</p>
          </div>
          <div v-if="unsubscribeResponse === true">
            <p>You are successfully unsubscribed! 希望我们后会有期!</p>
          </div>
        </div>
      </div>
    </div>

    <custom-footer></custom-footer>

  </div>
</template>

<script>
// @ is an alias to /src
import smallNav from '@/components/smallNav.vue'
import customFooter from '@/components/footer.vue'

export default {
  name: 'unsub',
  components: {
    'small-nav': smallNav,
    'custom-footer': customFooter
  },
  data () {
    return {
      params: {
        email: null,
        level: 'default'
      },
      unsubscribeAllInput: false,
      unsubscribeResponse: null
    }
  },
  mounted () {
    this.populateUserInfo()
  },
  methods: {
    // Prepopulates the input fields with the email and level if the user came from their email unsubscribe link
    // Example parameters - /unsub?level=1&email=me@testemail.com
    populateUserInfo () {
      if (this.$route.query.email) {
        this.params.email = this.$route.query.email
      }
      if (this.$route.query.level) {
        this.params.level = this.$route.query.level
      }
      if (this.$route.query.email) {
        // Once the input fields are populated, remove query parameters from URL
        let query = Object.assign({}, this.$route.query)
        delete query.level
        delete query.email
        this.$router.replace({ query })
      }
    },

    // Submit the user info to unsubscribe
    submitUnsubscribe () {
      // Reset the unsubscribe response
      this.unsubscribeResponse = null

      // If nothing is entered in email input field, do nothing
      if (this.params.email === null) {
        console.log('Email is null')
        return
      }

      // If 'unsubscribe all' is selected, set level parameter to 'all'
      if (this.unsubscribeAllInput === true) {
        this.params.level = 'all'
      }

      // If nothing is entered in level input field, do nothing
      if (this.params.level === 'default') {
        console.log('Level is default')
        return
      }

      // Call unsubscribe function
      this.subURL = 'https://api.haohaotiantian.com/unsub'
      return axios.post(this.subURL, {
        email: this.params.email,
        level: this.params.level
      })
        .then((response) => {
          if (response.data['success'] === true) {
            this.unsubscribeResponse = true
          } else {
            this.unsubscribeResponse = false
          }
        })
    }
  }
}
</script>

<style lang="scss">

  .unsubscribe-header {
    margin-bottom: 0;
  }

  .form-check {
    margin-right: 0;
  }

</style>
