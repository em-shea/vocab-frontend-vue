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

      <div class="row card-deck m-3">
        <div class="card-holder" v-for="card in recentWordList" :key="card['list_id']+card['date_sent']">
          <practice-sentence-card :card="card"></practice-sentence-card>
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
          <button type="button" class="btn btn-secondary">Load more</button>
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
import practiceSentenceCard from '../components/practiceSentenceCard.vue'

export default {
  name: 'user-sentences',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter,
    'list-dropdown': listDropdown,
    'practice-sentence-card': practiceSentenceCard
  },
  data () {
    return {
      userData: {},
      userLists: ['HSK 1'],
      loadingPage: true,
      recentWordList: null,
      sentenceUpdated: false,
      updatingSentence: false,
      userSentences: {},
      mockSentenceData: [
        {
          'sentence_id': '123',
          'sentence': '我喜欢学习汉语。',
          'list_id': '123',
          'date_created': '2024-04-27',
          'character_set': 'simplified',
          'word': {
            'Audio file key': '',
            'Definition': 'term; semester; CL:個|个[ge4]',
            'Difficulty level': 'Advanced',
            'HSK Level': '5',
            'Pinyin': 'xué qī',
            'Simplified': '学期',
            'Traditional': '學期'
          }
        },
        {
          'sentence_id': '234',
          'sentence': '我喜欢写句子。',
          'list_id': '234',
          'date_created': '2024-04-27',
          'character_set': 'simplified',
          'word': {
            'Audio file key': '',
            'Definition': 'term; semester; CL:個|个[ge4]',
            'Difficulty level': 'Advanced',
            'HSK Level': '5',
            'Pinyin': 'xué qī',
            'Simplified': '学期',
            'Traditional': '學期'
          }
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
    // await this.getRecentWords()
    await this.getSentences()
    this.loadingPage = false
  },
  methods: {
    async getRecentWords () {
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
            console.log('token: ', session.getIdToken().getJwtToken())
            return axios
              .get(process.env.VUE_APP_API_URL + 'sentences',
                {
                  headers: {
                    'Authorization': session.getIdToken().getJwtToken()
                  }
                }
              )
              .then((response) => {
                console.log(response)
                this.userSentences = response.data.sentences
                // for (let i = 0; i < 4; i++) {
                // Loop through sentence array - if date and list ID match item in recentWordList, add sentence to that item
                // }
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
        'sentence': '中文很好听。',
        'sentence_id': '',
        'word': {
          'Audio file key': 'https://s3.us-east-1.amazonaws.com/vocab-audio-staging/audio/.ab745f79-9728-4326-9dc1-332a181796f8.mp3',
          'Definition': 'term; semester; CL:個|个[ge4]',
          'Difficulty level': 'Advanced',
          'HSK Level': '5',
          'Pinyin': 'xué qī',
          'Simplified': '学期',
          'Traditional': '學期',
          'Word id': '1ec4a4cc-42d2-65fa-b218-acde48001122'
        }
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
              .post(process.env.VUE_APP_API_URL + 'sentences',
                mockRequestBody,
                {
                  headers: {
                    'Authorization': session.getIdToken().getJwtToken()
                  }
                })
              .then((response) => {
                console.log(response)
                // response.data.sentence_id
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
