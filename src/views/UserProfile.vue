<template>
  <div id="user-profile" class="light-background">

    <small-header></small-header>

    <div v-if="loadingPage" class="container loading-container">
      <div class="row mt-5">
        <div class="col d-flex justify-content-center">
          <div class="spinner-border text-secondary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!loadingPage" class="container main-container">
      <div class="row header-row">
        <div class="col">
        <!-- <div class="col-12 col-md-8"> -->
          <div class="card shadow-sm">
            <div class="card-body profile-header-card">
              <div class="row vertical-align">
                <div class="col-4 col-md-2 text-center">
                  <div class="card emoji-card shadow">
                    <div class="card-body emoji-card-body">
                      <h1 class="user-emoji" v-if="userData['user_alias_emoji'] !== 'Not set'">{{ userData['user_alias_emoji']}}</h1>
                      <h1 class="user-emoji" v-if="userData['user_alias_emoji'] === 'Not set'">📙</h1>
                    </div>
                  </div>
                </div>
                <div class="col-8">
                  <h3 class="mb-0 userAliasHeader" v-if="userData['user_alias'] !== 'Not set'">{{ userData['user_alias'] }}</h3>
                  <h5 class="userAliasHeader" v-if="userData['user_alias'] === 'Not set'">{{ userData['email_address'] }}</h5>
                  <p class="mb-0 text-muted" v-if="userData['user_alias_pinyin'] !== 'Not set'">{{ userData['user_alias_pinyin'] }}</p>
                  <p class="mb-0 text-muted user-date" v-if="userData['user_alias_pinyin'] !== 'Not set'">Studying since {{ userCreatedDate }}</p>
                  <p class="text-muted user-date" v-if="userData['user_alias_pinyin'] === 'Not set'">Studying since {{ userCreatedDate }}</p>
                  <p class="mb-0 orange-link" v-if="userData['user_alias'] === 'Not set'" v-on:click="$router.push('/profile-settings');">Set a profile name</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="desktop-header-btns col d-none d-md-flex">
          <div class="row">
            <div class="col-6 col-md-12 my-auto">
              <button type="button" class="btn btn-settings" v-on:click="$router.push('/manage-lists');">
                Manage lists
              </button>
            </div>
            <div class="col-6 col-md-12 my-auto">
              <button type="button" class="btn btn-settings float-right" v-on:click="$router.push('/profile-settings');">
                Profile settings
              </button>
            </div>
          </div>
        </div> -->
      </div>
      <!-- <div class="mobile-header-btns row d-flex d-md-none"> -->
      <div class="row">
        <div class="col-6">
          <button type="button" class="btn btn-settings" v-on:click="$router.push('/manage-lists');">
            Manage lists
          </button>
        </div>
        <div class="col-6">
          <button type="button" class="btn btn-settings float-right" v-on:click="$router.push('/profile-settings');">
            Profile settings
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div class="profile-header">
            <span class="oi oi-check header-icon"></span>
            <p class="profile-header-text">Daily quizzes</p>
          </div>
        </div>
      </div>
      <daily-quizzes :userQuizzes="userQuizzes"></daily-quizzes>
      <div class="row todays-word-row">
        <div class="col-12">
          <div class="profile-header">
            <span class="oi oi-book header-icon"></span>
            <p v-if="this.userLists.length === 1" class="profile-header-text">Today's word</p>
            <p v-else class="profile-header-text">Today's words</p>
          </div>
        </div>
        <div class="col" v-if="recentWordsList.length === 0">
          <div class="card shadow-sm text-center">
            <div class="card-body no-subs-card">
              <h6 class="card-text">You are not subscribed to any lists.</h6>
              <h6>Go to <span class="orange-link" v-on:click="$router.push('/manage-lists');">Manage lists</span> to subscribe.</h6>
            </div>
          </div>
        </div>
        <div class="col-md-12 col-lg-6" v-for="word in recentWordsList" :key="word['UniqueListId']">
          <div class="card shadow-sm text-center">
            <div class="card-body daily-word-card-body">
              <h5 v-if="word.CharacterSet === 'simplified'" class="card-text">{{ word.word.simplified }}</h5>
              <h5 v-if="word.CharacterSet === 'traditional'" class="card-text">{{ word.word.traditional }}</h5>
              <p class="card-text">{{ word.word.pinyin }} <span @click="playAudio(word.word.audio_file_key)" class="oi oi-volume-high audio-icon"></span></p>
              <p class="card-text truncate">{{ word.word.definition }}</p>
              <ul class="list-group list-group-flush">
                <li class="list-group-item text-muted">HSK Level {{ word.word.hsk_level }}, {{ word.CharacterSet }}</li>
              </ul>
              <div class="row justify-content-between">
                <div class="col">
                  <p class="card-link daily-word-link float-left" @click="$router.push({ path: 'quiz', query: {list_id: word.list_id, date_range: 14, ques: 10, char: word.CharacterSet}})">Quiz</p>
                </div>
                <div class="col">
                  <p class="card-link daily-word-link float-right" @click="$router.push({ path: 'review', query: {list_id: word.list_id, date_range: 30, char: word.CharacterSet}})">Review</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
          <!-- <div class="row justify-content-center">
            <div class="col">
              <p class="text-muted">HSK Level {{ word['Word']['HSK Level'] }}, {{ word['CharacterSet']}}</p>
            </div>
            <div class="col-3 px-0 d-flex justify-content-center">
              <p class="daily-word-link" @click="$router.push({ path: 'quiz', query: {list: word['ListId'], days: 14, ques: 10, char: word['CharacterSet']}})">Quiz</p>
            </div>
            <div class="col-3 px-0 d-flex justify-content-center">
              <p class="daily-word-link" @click="$router.push({ path: 'history', query: {list: word['ListId'], dates: 30, char: word['CharacterSet']}})">Review</p>
            </div>
          </div> -->
          <!-- <router-link :to="{path:'/election/1/voter', query: {voterId: 5}}">
            Quiz
          </router-link> -->
      <!-- <div class="row">
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
          Issue getting routed to writing practice page
          <button type="button" class="btn orange-button" v-on:click="$router.push('/writing-practice');">
            Practice sentences
          </button>
        </div>
      </div> -->
      <div class="row">
        <div class="col">
          <div class="profile-header">
            <span class="oi oi-star header-icon"></span>
            <p class="profile-header-text">Coming soon</p>
          </div>
        </div>
      </div>
      <div class="row justify-content-center pb-4">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body coming-soon-card text-center">
              Practice sentences
              <!-- <span class="oi oi-chevron-right float-right"></span> -->
            </div>
          </div>
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

    <custom-footer :footerWidth="footerWidth"></custom-footer>

  </div>

</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'
import dailyQuizzes from '@/components/dailyQuizzes.vue'
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'
import shared from './../shared'

export default {
  name: 'user-profile',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter,
    'daily-quizzes': dailyQuizzes
  },
  data () {
    return {
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      tempAudioFile: 'https://misc-static-es.s3.amazonaws.com/polly-test-audio.mp3',
      user: null,
      loadingPage: true,
      userData: {},
      userLists: [],
      recentWordsList: [],
      userQuizzes: [],
      footerWidth: 'narrow'
    }
  },
  created () {
    this.getSignedInUser = shared.getSignedInUser
  },
  computed: {
    signedIn () {
      if (this.user) {
        return true
      } else {
        return false
      }
    },
    userCreatedDate () {
      var d = new Date(this.userData['date_created'])
      let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
      let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d)
      return `${mo}, ${ye}`
    }
  },
  async mounted () {
    try {
      this.user = await this.getSignedInUser()
    } catch (error) {
      this.user = null
      this.$router.push('/signin')
    }
    try {
      await this.getUserData()
      await this.getRecentWords()
      await this.getUserQuizzes()
    } catch (error) {
      console.error(error)
    }
    this.loadingPage = false
  },
  methods: {
    async getUserData () {
      let userPoolData = {
        UserPoolId: process.env.VUE_APP_USER_POOL_ID,
        ClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID,
        Storage: localStorage
      }
      let userPool = new AmazonCognitoIdentity.CognitoUserPool(userPoolData)
      let cognitoUser = userPool.getCurrentUser()
      return new Promise((resolve, reject) => {
        if (cognitoUser != null) {
          cognitoUser.getSession((err, session) => {
            if (err) {
              console.log(err)
              reject(err)
            } else if (!session.isValid()) {
              console.log('Invalid session.')
              reject(Error('Invalid session.'))
            } else {
              // console.log('IdToken: ' + session.getIdToken().getJwtToken())
              return axios
                .get(process.env.VUE_APP_API_URL + 'user', {
                  headers: {
                    'Authorization': session.getIdToken().getJwtToken()
                  }
                }
                )
                .then((response) => {
                  // console.log('user api response', response.data)
                  this.userData = response.data
                  this.userLists = response.data['subscriptions']
                  resolve(this.userData, this.userLists)
                })
            }
          })
        } else {
          // console.log('User not found.')
          reject(Error('User not found.'))
        }
      })
    },
    async getRecentWords () {
      return new Promise((resolve, reject) => {
        try {
          return axios
            .get(process.env.VUE_APP_API_URL + 'review'
            )
            .then((response) => {
              // Create list with just the words from the most recent day
              // Add unique id - HSKLevel1simplified (temp fix before switching everything to list ids)
              let recentWordsListUnfiltered = []
              for (let [key, value] of Object.entries(response.data)) {
                // only copying value, not the entire dict
                let simplifiedEntry = Object.assign({}, value.slice(-1)[0])
                simplifiedEntry['UniqueListId'] = simplifiedEntry['list_id'].concat('simplified')
                simplifiedEntry['CharacterSet'] = 'simplified'
                let traditionalEntry = Object.assign({}, value.slice(-1)[0])
                traditionalEntry['UniqueListId'] = traditionalEntry['list_id'].concat('traditional')
                traditionalEntry['CharacterSet'] = 'traditional'
                recentWordsListUnfiltered.push(simplifiedEntry)
                recentWordsListUnfiltered.push(traditionalEntry)
              }
              // Remove spaces from user's list names (temp fix before switching everything to list ids)
              // Create unique id - HSKLevel1simplified
              let userListsUniqueIds = []
              for (let i = 0; i < this.userLists.length; i++) {
                if (this.userLists[i]['character_set'] === 'simplified') {
                  userListsUniqueIds.push(this.userLists[i]['list_id'].concat('simplified'))
                }
                if (this.userLists[i]['character_set'] === 'traditional') {
                  userListsUniqueIds.push(this.userLists[i]['list_id'].concat('traditional'))
                }
              }
              // Filter to just show words for the lists the user is subscribed to
              this.recentWordsList = recentWordsListUnfiltered.filter(elem => userListsUniqueIds.includes(elem['UniqueListId']))
              resolve(this.recentWordsList)
            })
        } catch (error) {
          console.error(error)
          reject(error)
        }
      })
    },
    async getUserQuizzes () {
      let userPoolData = {
        UserPoolId: process.env.VUE_APP_USER_POOL_ID,
        ClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID,
        Storage: localStorage
      }
      let userPool = new AmazonCognitoIdentity.CognitoUserPool(userPoolData)
      let cognitoUser = userPool.getCurrentUser()
      return new Promise((resolve, reject) => {
        if (cognitoUser != null) {
          cognitoUser.getSession((err, session) => {
            if (err) {
              console.log(err)
              reject(err)
            } else if (!session.isValid()) {
              console.log('Invalid session.')
              reject(Error('Invalid session.'))
            } else {
              // console.log('IdToken: ' + session.getIdToken().getJwtToken())
              return axios
                .get(process.env.VUE_APP_API_URL + 'quizzes', {
                  headers: {
                    'Authorization': session.getIdToken().getJwtToken()
                  }
                }
                )
                .then((response) => {
                  console.log('quiz api response', response.data)
                  this.userQuizzes = response.data
                  resolve(this.userQuizzes)
                })
            }
          })
        } else {
          // console.log('User not found.')
          reject(Error('User not found.'))
        }
      })
    },
    playAudio (audioFile) {
      let audio = new Audio(audioFile)
      audio.play()
    }
  }
}
</script>

<style lang="scss" scoped>
  @media only screen and (min-width: 500px) {
    .main-container {
      max-width: 55rem;
      padding: 1em 15px;
    }
    // .truncate {
    //   width: 100%;
    //   white-space: nowrap;
    //   overflow: hidden;
    //   text-overflow: ellipsis;
    // }
    .full-length {
      white-space: wrap;
    }
  }
  .loading-container {
    height: 550px;
  }
  .main-container {
    padding-bottom: 3rem;
  }
  .light-background {
    background: #f8f9fa;
  }
  .row {
    padding: .5rem,
  }
  .header-row {
    padding-top: 1rem;
  }
  .profile-header-card {
    padding: 1em;
  }
  .btn-settings {
    min-width: 100%;
    cursor: pointer;
    background-color: #fe4c00;
    border-color: #fe4c00;
    color: white;
    // border-radius: .5em;
    // min-width: 200px;
    // margin: .5em;
  }
  .card {
    border-radius: 1rem;
    margin: 0.75rem 0rem;
    border: none;
  }
  .daily-word-card-body {
    margin-top: 0.5rem;
  }
  .no-subs-card {
    padding: 1rem 0.5rem;
  }
  .coming-soon-card {
    padding: 1rem;
  }
  .todays-word-row {
    justify-content: space-around;
  }
  .user-date {
    font-size: 0.9rem;
  }
  .orange-link {
    color: orangered;
    text-decoration: underline;
  }
  .orange-link:hover {
    cursor: pointer;
  }
  .daily-word-link {
    color: orangered;
    text-decoration: underline;
    margin-bottom: 0;
    padding: 0rem 1rem;
  }
  .daily-word-link:hover {
    cursor: pointer;
  }
  .emoji-card {
    border-radius: 5rem;
    width: 5.5rem;
    height: 5.5rem;
    margin: 0 auto;
  }
  .emoji-card-body {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .user-emoji {
    margin: 0;
    font-size: 3.5rem;
  }
  .user-subtext {
    font-size: 0.9rem;
  }
  .vertical-align {
    display: flex;
    align-items: center;
  }
  .profile-header {
    margin-top: 1rem;
  }
  .profile-header-text {
    display: inline;
    padding-left: 10px;
  }
  // .coming-soon-btn {
  //   background: #d3d3d4;
  // }
</style>
