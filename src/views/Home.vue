<template>
  <div id="home" class="home">

    <large-header></large-header>
    <nav-bar class="sticky-top"></nav-bar>

      <div class="container bg-light p-1">
        <div class="row mx-3 subscribe-text">
          <div class="col">
            <p class="mb-0">
              Subscribe to receive daily vocab word emails.
            </p>
          </div>
        </div>
        <div class="row mx-3 mb-3">
          <div class="col-md-4 col-xs-6 p-3" v-if="characterSet == 'simplified'">
            <select v-model="params.list" class="custom-select" id="list">
              <option selected value="default">Choose an HSK Level</option>
              <option v-for="list in hskLists" :key="list.listId" :value="list">{{ list.listLevel }} - Simplified</option>
            </select>
          </div>
          <div class="col-md-4 col-xs-6 p-3" v-if="characterSet == 'traditional'">
            <select v-model="params.list" class="custom-select" id="list">
              <option selected value="default">Choose an HSK Level</option>
              <option v-for="list in hskLists" :key="list.listId" :value="list">{{ list.listLevel }} - Traditional</option>
            </select>
          </div>
          <div class="col-md-8 col-xs-6 p-3">
            <div class="input-group">
              <input type="email" v-model="params.email" class="form-control" id="subscribe" value="" placeholder="Email address" aria-label="Email address" aria-describedby="button-addon2">
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button" id="button-addon2" v-on:click="submitSubscription();">
                  <span v-if="submittingSub" class="spinner-border spinner-border-sm mb-1 mx-1" role="status" aria-hidden="true"></span>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="listValidated === false" class="container">
        <div class="row m-3">
          <div class="col text-center sub-response" id="sub-response">
            <p>Please select an HSK level.</p>
          </div>
        </div>
      </div>
      <div v-if="emailInputted === false || emailValidated === false" class="container">
        <div class="row m-3">
          <div class="col text-center sub-response" id="sub-response">
            <p>Please enter a valid email.</p>
          </div>
        </div>
      </div>
      <div v-if="subscribeResponse === false" class="container">
        <div class="row m-3">
          <div class="col text-center sub-response" id="sub-response">
            <p>Something went wrong. Try refreshing the page, or contact us at help@haohaotiantian.com.</p>
          </div>
        </div>
      </div>
      <div v-if="userExists === true" class="container">
        <div class="row m-3">
          <div class="col text-center sub-response" id="sub-response">
            <p>Something went wrong. If you are already subscribed, please <router-link :to="{ name: 'sign-in'}">sign in</router-link> to your account to manage your subscriptions.</p>
          </div>
        </div>
      </div>

      <div class="container mt-4">
        <div class="row m-3">
          <div class="col-12">
            <h4>Which HSK level are you?</h4>
          </div>
          <div class="col-12">
            <p>Click on each level below to see sample words, or check out <router-link :to="{ name: 'history'}">recent daily words</router-link>.</p>
          </div>
        </div>
      </div>

      <div class="container mb-4" v-if="sampleVocabLoading">
        <div class="row">
          <div class="col d-flex justify-content-center">
            <div class="spinner-border text-secondary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
      <div class="container mb-4" v-if="!sampleVocabLoading">
        <div class="row m-3">
          <div class="col-4 col-md-3" id="v-pills-col">
            <div v-for="(key, level) in exampleWordList" v-bind:key="level" v-on:click="exampleListSelected = level" class="nav flex-column nav-pills text-center" id="v-pills-tab" role="tablist">
              <span class="nav-link" :class="{ active : level === exampleListSelected }" :id="'#v-pills-tab-'+level" data-toggle="pill" role="tab">
                <span class="pills-tab-desktop">Level {{ level }}</span>
                <span class="pills-tab-mobile">{{ level }}</span>
              </span>
            </div>
          </div>
          <div class="col-8 col-md-9">
            <div class="tab-content" id="v-pills-tabContent">
              <div v-for="word in exampleWordList[exampleListSelected]" v-bind:key="word['Word']" class="card shadow-sm p-2">
                <div v-if="characterSet === 'simplified'" class="card-body">{{ word['Word'] }}</div>
                <div v-if="characterSet === 'traditional'" class="card-body">{{ word['Word-Traditional'] }}</div>
                <div class="card-body">{{ word['Pronunciation'] }}</div>
                <div class="card-body">{{ word['Definition'] }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Content -->
      <faq-content></faq-content>

    <custom-footer></custom-footer>

    <!-- </div> -->
  </div>
</template>

<script>
// @ is an alias to /src
import faqContent from '@/components/faqContent.vue'
import largeHeader from '@/components/header.vue'
import customFooter from '@/components/footer.vue'
import navBar from '@/components/navBar.vue'
import { Auth } from 'aws-amplify'
import { CognitoUser } from 'amazon-cognito-identity-js'

export default {
  name: 'home',
  components: {
    'custom-footer': customFooter,
    'large-header': largeHeader,
    'faq-content': faqContent,
    'nav-bar': navBar
  },
  data () {
    return {
      params: {
        email: null,
        list: 'default'
      },
      cognitoUser: CognitoUser,
      submittingSub: false,
      emailValidated: null,
      emailInputted: null,
      listValidated: null,
      userExists: null,
      exampleWordList: [],
      sampleVocabLoading: true,
      exampleListSelected: '1',
      subscribeResponse: null,
      hskLists: [
        { listLevel: '1', listName: 'HSK Level 1', listId: '1ebcad3f-5dfd-6bfe-bda4-acde48001122' },
        { listLevel: '2', listName: 'HSK Level 2', listId: '1ebcad3f-adc0-6f42-b8b1-acde48001122' },
        { listLevel: '3', listName: 'HSK Level 3', listId: '1ebcad3f-f815-6b92-b3e8-acde48001122' },
        { listLevel: '4', listName: 'HSK Level 4', listId: '1ebcad40-414f-6bc8-859d-acde48001122' },
        { listLevel: '5', listName: 'HSK Level 5', listId: '1ebcad40-bb9e-6ece-a366-acde48001122' },
        { listLevel: '6', listName: 'HSK Level 6', listId: '1ebcad41-197a-6700-95a3-acde48001122' }
      ]
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    }
  },
  mounted () {
    this.getSampleWords()
  },
  methods: {
    getSampleWords () {
      return axios
        .get(process.env.VUE_APP_API_URL + 'sample_vocab', {}
        )
        .then((response) => {
          this.exampleWordList = response.data
          this.sampleVocabLoading = false
          // console.log(this.exampleWordList)
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
    },
    async submitSubscription () {
      this.submittingSub = true
      this.subscribeResponse = null
      this.emailValidated = null
      this.emailInputted = null
      this.listValidated = null
      if (this.params.list === 'default') {
        this.listValidated = false
        return false
      }
      if (!this.validateEmail()) {
        return
      }
      try {
        let cognitoSignupResponse = await this.signUpCognitoUser()
        console.log('cognito id...', cognitoSignupResponse)
        let promises = [
          this.sendCode(),
          this.createNewUser(cognitoSignupResponse.userSub)
        ]
        let responses = await Promise.all(promises)
        console.log(responses)
        this.$router.push('/subscribed')
      } catch (error) {
        console.error(error)
        if (error.code === 'UsernameExistsException') {
          this.userExists = true
        } else {
          this.subscribeResponse = false
        }
      }
      this.submittingSub = false
    },
    async signUpCognitoUser () {
      let cognitoParams = {
        username: this.params.email,
        password: this.getRandomString()
      }
      return Auth.signUp(cognitoParams)
    },
    async createNewUser (userCognitoId) {
      this.subURL = process.env.VUE_APP_API_URL + 'set_subs'
      let response = await axios.post(this.subURL, {
        'cognito_id': userCognitoId,
        'email': this.params.email,
        'character_set_preference': this.characterSet,
        'lists': [
          {
            'list_id': this.params.list.listId,
            'list_name': this.params.list.listName,
            'character_set': this.characterSet
          }]
      })
      return response
    },
    async sendCode () {
      try {
        this.cognitoUser = await Auth.signIn(this.params.email)
      } catch (err) {
        console.log(err)
      }
      this.$root.$data.store.storeSessionData(this.cognitoUser.username, this.cognitoUser.Session)
    },
    getRandomString () {
      let randomString = Date.now().toString(36) + Math.random().toString(36).substring(2)
      return randomString
    }
  }
}
</script>

<style scoped>
  .nav-link {
    color: #fe4c00;
  }

  .nav-link:hover {
    color: hsla(16, 100%, 40%, 1);
    cursor: pointer;
  }

  .nav-pills .nav-link.active, .nav-pills .show>.nav-link {
    color: #fff;
    background-color: #fe4c00;
  }

  .progress-bar {
    background: rgb(255,76,0);
    background: linear-gradient(90deg, rgba(255,76,0,1) 0%, rgba(255,145,0,1) 100%);
  }

  .sticky-top {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1020;
  }

  .subscribe-text {
    margin-top: 1.6rem;
    margin-bottom: 0;
  }

  @media only screen and (min-width: 500px) and (max-width: 2000px) {
    .pills-tab-mobile {
      display: none;
    }
    .pill-tab-desktop {
      display: inline;
    }
  }

  @media only screen and (min-width: 0px) and (max-width: 500px) {
    .pills-tab-desktop {
      display: none;
    }
    .pills-tab-mobile {
      display: inline;
    }
  }

</style>
