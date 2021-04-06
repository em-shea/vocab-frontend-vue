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
            <select v-model="params.level" class="custom-select" id="level">
              <option selected value="default">Choose an HSK Level</option>
              <option value="1">1 - Simplified</option>
              <option value="2">2 - Simplified</option>
              <option value="3">3 - Simplified</option>
              <option value="4">4 - Simplified</option>
              <option value="5">5 - Simplified</option>
              <option value="6">6 - Simplified</option>
            </select>
          </div>
          <div class="col-md-4 col-xs-6 p-3" v-if="characterSet == 'traditional'">
            <select v-model="params.level" class="custom-select" id="level">
              <option selected value="default">Choose an HSK Level</option>
              <option value="1">1 - Traditional</option>
              <option value="2">2 - Traditional</option>
              <option value="3">3 - Traditional</option>
              <option value="4">4 - Traditional</option>
              <option value="5">5 - Traditional</option>
              <option value="6">6 - Traditional</option>
            </select>
          </div>
          <div class="col-md-8 col-xs-6 p-3">
            <div class="input-group">
              <input type="email" v-model="params.email" class="form-control" id="subscribe" value="" placeholder="Email address" aria-label="Email address" aria-describedby="button-addon2">
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button" id="button-addon2" v-on:click="submitSubscription();">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="subSubmitted" class="container">
        <div class="row m-3">
          <div class="col text-center sub-response" id="sub-response">
            <div v-if="levelValidated === false">
              <p>Please select an HSK level.</p>
            </div>
            <div v-if="emailInputted === false || emailValidated === false">
              <p>Please enter a valid email.</p>
            </div>
            <div v-if="subscribeResponse === false">
              <p>Something went wrong. Try refreshing the page, or contact us (see bottom of FAQ).</p>
            </div>
            <div v-if="subscribeResponse">
              <p>成功！Success! You're subscribed and will receive a confirmation email.</p>
            </div>
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

      <div class="container mb-4">
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
        level: 'default'
      },
      emailValidated: null,
      emailInputted: null,
      levelValidated: null,
      exampleWordList: [],
      exampleListSelected: '1',
      subscribeResponse: null,
      subSubmitted: false
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
          console.log(this.exampleWordList)
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

    submitSubscription () {
      this.subSubmitted = true
      this.subscribeResponse = null
      this.emailValidated = null
      this.emailInputted = null
      this.levelValidated = null
      if (this.params.level === 'default') {
        this.levelValidated = false
        return false
      }
      if (!this.validateEmail()) {
        return
      }

      try {
        this.signUpCognitoUser()
      } catch (error) {
        console.error(error)
      }

      // console.log('Calling submitSub... ')

      this.subURL = process.env.VUE_APP_API_URL + 'sub'
      // console.log('sub url...', this.subURL)

      // console.log('query params...', {
      //   email: this.params.email,
      //   list: this.params.level + '-' + this.characterSet
      // })

      // return axios.post(this.subURL, {
      //   email: this.params.email,
      //   list: this.params.level + '-' + this.characterSet
      // })
      //   .then((response) => {
      //     this.subscribeResponse = response.data['success']
      //     // console.log(response.data)
      //   })
    },
    async signUpCognitoUser () {
      let cognitoParams = {
        username: this.params.email,
        password: this.getRandomString()
      }
      await Auth.signUp(cognitoParams)
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
