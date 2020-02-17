<template>

  <!-- Main page for new users to subscribe, app information -->
  <div id="home">

    <!-- <div class="jumbotron jumbotron-fluid bg-img">
      <div class="container">
        <div class="row">
          <div class="col title">
            <h1 class="display-6">Daily Chinese Vocab</h1>
            <p class="lead">Keep up on 中文 with daily HSK vocabulary in your inbox.</p>
          </div>
        </div>
      </div>
    </div> -->

    <large-header :charSet.sync="characterSet"></large-header>

    <div class="container bg-white sticky-top p-2">
      <div class="row justify-content-center">
        <ul class="nav" id="navbar">
          <li class="nav-item">
            <a class="nav-link active" href="#sub">Subscribe</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#sample">Sample Words</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#faq">FAQ</a>
          </li>
          <!-- <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'quiz'}">Practice</router-link>
          </li> -->
        </ul>
      </div>
    </div>

    <div data-spy="scroll" data-target="#navbar" data-offset="0">

      <div class="container bg-light p-1">
        <div class="anchor-target" id="sub"></div>
        <div class="row m-3">
          <div class="col-md-4 col-xs-6 p-3">
            <select v-model="params.level" class="custom-select" id="level">
              <option selected value="default">Choose an HSK Level</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
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

      <div class="container">
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
        <div class="anchor-target" id="sample"></div>
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

    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import faqContent from '@/components/faqContent.vue'
import largeHeader from '@/components/header.vue'
import customFooter from '@/components/footer.vue'

export default {
  name: 'home',
  components: {
    'custom-footer': customFooter,
    'large-header': largeHeader,
    'faq-content': faqContent
  },
  data () {
    return {
      characterSet: 'simplified',
      params: {
        email: null,
        level: 'default'
      },
      emailValidated: null,
      emailInputted: null,
      levelValidated: null,
      exampleWordList: [],
      exampleListSelected: '1',
      subscribeResponse: null
    }
  },
  mounted () {
    this.getSampleWords()
    console.log('characterset...', this.characterSet)
  },
  methods: {
    getSampleWords () {
      return axios
        .get('https://api.haohaotiantian.com/sample_vocab', {}
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

      console.log('Parameters... ', this.params)

      this.subURL = 'https://api.haohaotiantian.com/sub'
      return axios.post(this.subURL, {
        email: this.params.email,
        level: this.params.level
      })
        .then((response) => {
          this.subscribeResponse = response.data['success']
          console.log(response.data)
        })
    }
  }
}
</script>

<style lang="scss">
  .nav-link {
    color: orangered;
  }

  .nav-link:hover {
    color: hsla(16, 100%, 40%, 1);
    cursor: pointer;
  }

  .nav-pills .nav-link.active, .nav-pills .show>.nav-link {
    color: #fff;
    background-color: orangered;
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
