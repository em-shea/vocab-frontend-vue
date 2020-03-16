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
        <div class="col-xl-4 col-lg-6 col-12 p-3">
          <div class="input-group">
            <input type="email" v-model="params.email" class="form-control" id="subscribe" value="" placeholder="Email address" aria-label="Email address" aria-describedby="button-addon2">
          </div>
        </div>
        <div class="col-xl-4 col-lg-6 col-12 p-3" v-if="characterSet == 'simplified'">
          <select v-model="params.level" :disabled="unsubscribeAllInput" class="custom-select" id="level">
            <option selected value="default">Choose an HSK Level</option>
            <option value="1">1 - Simplified</option>
            <option value="2">2 - Simplified</option>
            <option value="3">3 - Simplified</option>
            <option value="4">4 - Simplified</option>
            <option value="5">5 - Simplified</option>
            <option value="6">6 - Simplified</option>
          </select>
        </div>
        <div class="col-xl-4 col-lg-6 col-12 p-3" v-if="characterSet == 'traditional'">
          <select v-model="params.level" :disabled="unsubscribeAllInput" class="custom-select" id="level">
            <option selected value="default">Choose an HSK Level</option>
            <option value="1">1 - Traditional</option>
            <option value="2">2 - Traditional</option>
            <option value="3">3 - Traditional</option>
            <option value="4">4 - Traditional</option>
            <option value="5">5 - Traditional</option>
            <option value="6">6 - Traditional</option>
          </select>
        </div>
        <div class="form-check form-check-inline col-xl-2 col-6 p-3">
          <input type="checkbox" v-model="unsubscribeAllInput" class="form-check-input" id="exampleCheck1">
          <label class="form-check-label pl-1" for="exampleCheck1">Unsubscribe all</label>
        </div>
        <div class="col-xl-2 col-6 p-3">
          <button class="btn btn-outline-secondary unsub-btn" type="button" id="button-addon2" v-on:click="submitUnsubscribe();">Unsubscribe</button>
        </div>
      </div>
      <div class="row m-3">
        <div class="col text-center sub-response" id="sub-response">
          <div v-if="unsubscribeResponse === false">
            <p>Something went wrong. Try refreshing the page, or let us know at contact@haohaotiantian.com.</p>
          </div>
          <div v-if="unsubscribeResponse === true">
            <p v-if="characterSet == 'simplified'">You are successfully unsubscribed! 希望我们后会有期!</p>
            <p v-if="characterSet == 'traditional'">You are successfully unsubscribed! 希望我們後會有期!</p>
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
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
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
        list_id: this.params.level + '-' + this.characterSet
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

  .unsub-btn {
    float: right;
  }

  @media(min-width:1200px) {
    .unsub-btn {
      float: left;
    }
  }

</style>
