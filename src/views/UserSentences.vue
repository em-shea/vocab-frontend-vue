<template>
  <div id="user-sentences">

    <small-header></small-header>
    <div v-if="loadingPage" class="container">
      <div class="row mt-5">
        <div class="col d-flex justify-content-center">
          <div class="spinner-border text-secondary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!loadingPage" class="container">
      <div class="row">
        <div class="col">
          <button type="button" class="btn btn-light my-3" @click="$router.push('/profile')">
            <span class="oi oi-chevron-left oi-icon menu-icon" title="oi-chevron-left"></span>
            Back
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-7">
          <h5>
            Practice sentences
          </h5>
        </div>
      </div>
      <button class="btn btn-outline-secondary" type="button" @click="updateSentence()">test button</button>
      <div class="row" v-if="userLists.length > 1">
        <div class="col">
          <list-dropdown :userLists="userLists"></list-dropdown>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="card shadow-sm" v-for="item in daysOfTheWeek" :key=item.date>
            <div class="card-body">
              <div class="row">
                <div class="col-12">
                  <div class="p">
                    {{ item }}
                  </div>
                </div>
                <div class="row">
                  <div class="col">

                  </div>
                </div>
                <div class="col">
                  <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="" aria-label="" aria-describedby="basic-addon2">
                    <!-- <input v-if="item.date > todaysDate disabled" v-model="" type="text" class="form-control" placeholder="" aria-label="" aria-describedby="basic-addon2"> -->
                    <div class="input-group-append">
                      <button class="btn btn-outline-secondary" type="button" @click="updateSentence()">Save</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="btn-group" role="group" aria-label="Change page">
            <button type="button" class="btn btn-secondary">Previous</button>
            <button type="button" class="btn btn-secondary">Next</button>
          </div>
        </div>
      </div>
    </div>
    <custom-footer></custom-footer>
  </div>

</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'
import listDropdown from '@/components/listDropdown.vue'
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'
import shared from './../shared'

export default {
  name: 'user-sentences',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter,
    'list-dropdown': listDropdown
  },
  data () {
    return {
      userData: {},
      userLists: ['HSK 1'],
      loadingPage: true,
      displayWeek: 0, // -1, -2
      // datesThisWeek: [{'day': 'Sunday', 'date': '20211010'}],
      datesThisWeek: [],
      daysOfTheWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      todaysDate: null,
      recentWordList: null,
      sentenceUpdated: false,
      updatingSentence: false,
      userSentences: {},
      mockSentenceData: [
        {
          'sentence_id': '123',
          'sentence': '我喜欢学习汉语。',
          'date_created': '2021-11-04T23:06:48.467526',
          'list_id': '123',
          'character_set': 'simplified'
        },
        {
          'sentence_id': '234',
          'sentence': '我喜欢写句子。',
          'date_created': '2021-11-02T23:06:48.467526',
          'list_id': '234',
          'character_set': 'simplified'
        }
      ]
    }
  },
  computed: {

  },
  created () {
    this.getUserData = shared.getUserData
  },
  async mounted () {
    // try {
    //   this.userData = await this.getUserData()
    // } catch (error) {
    //   console.log('Error retrieving user data')
    // }
    // console.log('all lists', this.allAvailableLists)
    await this.getSentences()
    this.generateThisWeek()
    this.loadingPage = false
  },
  methods: {
    generateThisWeek () {
      let today = new Date()
      // this.todaysDate = today.toString()
      // console.log(this.todaysDate)
      let todaysDay = this.daysOfTheWeek[ today.getDay() ]
      console.log(todaysDay)
      // set todays date and day
      // set this weeks date and day
    },
    getRecentWords () {
      let params = {
        'list': '',
        'date_range': ''
      }
      return axios
        .get(process.env.VUE_APP_API_URL + 'history?', { params: params }
        )
        .then((response) => {
          this.recentWordList = response.data[params.list].slice().reverse()
        })
    },
    async getSentences () {
      let userPoolData = {
        UserPoolId: process.env.VUE_APP_USER_POOL_ID,
        ClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID,
        Storage: localStorage
      }
      let userPool = new AmazonCognitoIdentity.CognitoUserPool(userPoolData)
      let cognitoUser = userPool.getCurrentUser()
      if (cognitoUser != null) {
        cognitoUser.getSession((err, session) => {
          if (err) {
            console.log(err)
          } else if (!session.isValid()) {
            console.log('Invalid session.')
          } else {
            return axios
              .get(process.env.VUE_APP_API_URL + 'sentence',
                {
                  headers: {
                    'Authorization': session.getIdToken().getJwtToken()
                  }
                }
              )
              .then((response) => {
                console.log(response)
                this.userSentences = response.data.sentences
              })
          }
        })
      } else {
        console.log('User not found.')
      }
    },
    updateSentence () {
      this.updatingSentence = true
      let mockRequestBody = {
        'list_id': '5678',
        'character_set': 'simplified',
        'sentence': '我喜欢法语。', 
        'sentence_id': ''
      }
      console.log(mockRequestBody)
      let userPoolData = {
        UserPoolId: process.env.VUE_APP_USER_POOL_ID,
        ClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID,
        Storage: localStorage
      }
      let userPool = new AmazonCognitoIdentity.CognitoUserPool(userPoolData)
      let cognitoUser = userPool.getCurrentUser()
      if (cognitoUser != null) {
        cognitoUser.getSession((err, session) => {
          if (err) {
            console.log(err)
          } else if (!session.isValid()) {
            console.log('Invalid session.')
          } else {
            // console.log('IdToken: ' + session.getIdToken().getJwtToken())
            return axios
              .post(process.env.VUE_APP_API_URL + 'sentence',
                mockRequestBody,
                {
                  headers: {
                    'Authorization': session.getIdToken().getJwtToken()
                  }
                })
              .then((response) => {
                console.log(response)
                response.data.sentence_id
                this.updatingSentence = false
                this.sentenceUpdated = true
              })
          }
        })
      } else {
        console.log('User not found.')
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
