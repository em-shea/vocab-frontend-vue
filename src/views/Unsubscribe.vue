<template>

  <!-- Page for users to unsubscribe to one or all lists -->
  <div id="unsub">

    <small-header></small-header>

    <div class="container">

      <div class="row m-3">
        <div class="col-12">
          <p class="unsubscribe-header">Select an HSK level to unsubscribe from, or unsubscribe from all Haohaotiantian emails.</p>
        </div>
      </div>

      <div class="row unsub-row m-3 bg-light">
        <div class="col-xl-3 col-lg-6 col-12 p-3">
          <div class="input-group">
            <input type="email" v-model="params.email" class="form-control" id="subscribe" value="" placeholder="Email address" aria-label="Email address" aria-describedby="button-addon2">
          </div>
        </div>
        <!-- Use dynamic vocabListIds instead -->
        <!-- How to v-model on params.listId and vocabListIds -->
        <!-- Filter list based on character set? Or just include all and select the given one? -->
        <div class="col-xl-4 col-lg-6 col-12 p-3">
          <select v-model="params.listId" :disabled="unsubscribeAllInput" class="custom-select" id="level">
            <option v-for="list in vocabListIds" :value="list.unique_list_id" :key="list.unique_list_id">{{ list['list_name'] }} - {{ list['character_set'] }}</option>
          </select>
        </div>
        <div class="form-check form-check-inline unsub-all col-xl-3 col-6">
          <input type="checkbox" v-model="unsubscribeAllInput" class="form-check-input" id="exampleCheck1">
          <label class="form-check-label pl-1" for="exampleCheck1">Unsubscribe all</label>
        </div>
        <div class="col-xl-2 col-6 p-3">
          <button class="btn btn-outline-secondary unsub-btn" type="button" id="button-addon2" v-on:click="unsubscribe();">Unsubscribe</button>
        </div>
      </div>
      <div class="row m-3">
        <div class="col text-center sub-response" id="sub-response">
          <div v-if="unsubscribeResponse === false">
            <p>Something went wrong. Try refreshing the page, or let us know at contact@haohaotiantian.com.</p>
          </div>
          <div v-if="emailInputted === false || emailValidated === false">
            <p>Please enter a valid email.</p>
          </div>
          <div v-if="levelValidated === false">
            <p>Please select an HSK level or select 'Unsubscribe all.'</p>
          </div>
          <div v-if="unsubscribeResponse === true">
            <p v-if="characterSet == 'simplified'">You are successfully unsubscribed! 希望我们后会有期!</p>
            <p v-if="characterSet == 'traditional'">You are successfully unsubscribed! 希望我們後會有期!</p>
          </div>
        </div>
      </div>
      <div class="row m-3">
        <div class="col-12">
        To manage your subscriptions or subscribe to different lists, <router-link :to="{ name: 'sign-in'}">click here to sign in to your account</router-link>.
        </div>
      </div>
    </div>

    <custom-footer :footerWidth="footerWidth"></custom-footer>

  </div>
</template>

<script>
// @ is an alias to /src
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'
import vocabListIds from '@/assets/vocabListIds.json'

export default {
  name: 'unsub',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {
      params: {
        email: null,
        listId: vocabListIds[0]['unique_list_id']
      },
      vocabListIds: vocabListIds,
      unsubscribeListParam: null,
      unsubscribeAllInput: false,
      unsubscribeResponse: null,
      emailValidated: null,
      emailInputted: null,
      levelValidated: null,
      footerWidth: 'narrow'
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    },
    selectedList () {
      let selectedList = ''
      for (let i = 0; i < this.vocabListIds.length; i++) {
        if (this.vocabListIds[i]['unique_list_id'] === this.params.listId) {
          selectedList = this.vocabListIds[i]
        }
      }
      return selectedList
    }
  },
  mounted () {
    this.populateUserInfo()
  },
  methods: {
    // Prepopulates the input fields with the email and level if the user came from their email unsubscribe link
    // Example parameters - /unsub?level=1&email=me@testemail.com&char=simplified
    populateUserInfo () {
      console.log(this.$route.query)
      if (this.$route.query.email) {
        this.params.email = this.$route.query.email
      }
      if (this.$route.query.list && this.$route.query.char) {
        this.params.listId = this.$route.query.list + '#' + this.$route.query.char
        this.$root.$data.store.changeCharacterSet(this.$route.query.char.toLowerCase())
      }
      if (this.$route.query.email || this.$route.query.list || this.$route.query.char) {
        // Once the input fields are populated, remove query parameters from URL
        let query = Object.assign({}, this.$route.query)
        delete query.email
        delete query.list
        delete query.char
        this.$router.replace({ query })
      }
    },

    // Submit the user info to unsubscribe
    unsubscribe () {
      // Reset the unsubscribe response
      this.unsubscribeResponse = null
      this.emailValidated = null
      this.emailInputted = null
      this.levelValidated = null

      if (!this.validateEmail()) {
        return false
      }

      if (this.unsubscribeAllInput === true) {
        this.unsubscribeListParam = ''
      } else {
        this.unsubscribeListParam = this.selectedList
      }

      this.subURL = process.env.VUE_APP_API_URL + 'unsub'
      return axios.post(this.subURL, {
        cognito_id: '',
        email: this.params.email,
        list: this.unsubscribeListParam
      })
        .then((response) => {
          if (response.data['success'] === true) {
            this.unsubscribeResponse = true
          } else {
            this.unsubscribeResponse = false
          }
        })
    },

    validateEmail () {
      if (this.params.email === null) {
        this.emailInputted = false
        return false
      } if (this.params.email.indexOf('@') === -1) {
        this.emailValidated = false
        return false
      } else {
        this.emailValidated = true
        return true
      }
    }
  }
}
</script>

<style scoped>
  .container {
    min-height: 100vh;
  }
  .unsubscribe-header {
    margin-bottom: 0;
  }

  .form-check {
    margin-right: 0;
  }

  .unsub-btn {
    float: right;
  }

  .unsub-all {
    padding: 16px 0px 16px 16px;
  }

  @media(min-width:1200px) {
    .unsub-btn {
      float: left;
    }
  }

  @media only screen and (min-width: 500px) and (max-width: 2000px) {
    .container {
      max-width: 55rem;
      padding: 1em 15px;
    }

    .unsub-row {
      justify-content: between;
    }
  }

  @media only screen and (min-width: 0px) and (max-width: 500px) {

  }

</style>
