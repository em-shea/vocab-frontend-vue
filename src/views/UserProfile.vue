<template>
  <div id="user-profile">

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
    <div v-if="!loadingPage" class="container main-container bg-light">
      <div class="row header-row">
        <div class="col">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="row vertical-align">
                <div class="col-4 text-center">
                  <div class="card emoji-card shadow">
                    <div class="card-body">
                      <h1 class="user-emoji">{{ userData['user_alias_emoji']}}</h1>
                    </div>
                  </div>
                </div>
                <div class="col">
                  <h3 class="userAliasHeader" v-if="userData['user_alias'] !== 'Not set'">{{ userData['user_alias'] }}</h3>
                  <p class="mb-0 text-muted">{{ userData['user_alias_pinyin'] }}</p>
                  <p class="mb-2 text-muted user-date">Studying since {{ userCreatedDate }}</p>
                </div>
              </div>
            </div>
          </div>
          <!-- <h5 class="userAliasHeader">{{ userData['email_address'] }}</h5>
          <p class="mb-2 set-profile-text" v-on:click="$router.push('/profile-settings');">Set a profile name</p> -->
        </div>
      </div>
      <div class="row justify-content-center">
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
      <!-- <div class="row header-row" v-if="userData['user_alias'] !== 'Not set'">
        <div class="col">
          <h3 class="userAliasHeader">{{ userData['user_alias'] }}</h3>
          <p class="mb-0 text-muted">{{ userData['user_alias_pinyin'] }}</p>
          <p class="mb-2 text-muted">Studying since {{ userCreatedDate }}</p>
          Level/Experience: 新手， 大二，
        </div>
      </div> -->
      <div class="row">
        <div v-if="this.userLists.length === 1" class="col-12">Today's word</div>
        <div v-else class="col-12">Today's words</div>
        <div class="col-md-12 col-lg-6" v-for="word in recentWordsList" :key="word['UniqueListId']">
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <h5 v-if="word['CharacterSet'] === 'simplified'" class="card-text">{{ word['Word']['Word'] }}</h5>
              <h5 v-if="word['CharacterSet'] === 'traditional'" class="card-text">{{ word['Word']['Word-Traditional'] }}</h5>
              <p class="card-text">{{ word['Word']['Pronunciation'] }}</p>
              <p class="card-text">{{ word['Word']['Definition'] }}</p>
              <ul class="list-group list-group-flush">
                <li class="list-group-item text-muted">HSK Level {{ word['Word']['HSK Level'] }}, {{ word['CharacterSet']}}</li>
              </ul>
              <div class="row justify-content-between">
                <div class="col">
                  <a class="card-link daily-word-link float-left" @click="$router.push({ path: 'quiz', query: {list: word['ListId'], days: 14, ques: 10, char: word['CharacterSet']}})">Quiz</a>
                </div>
                <div class="col"> 
                  <a class="card-link daily-word-link float-right" @click="$router.push({ path: 'history', query: {list: word['ListId'], dates: 30, char: word['CharacterSet']}})">Review</a>
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
          Coming soon
        </div>
      </div>
      <div class="row justify-content-center">
        <div class="col-12">
          <div class="card card-button shadow-sm">
            <div class="card-body text-center">
              My quizzes
              <!-- <span class="oi oi-chevron-right float-right"></span> -->
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="card card-button shadow-sm">
            <div class="card-body text-center">
              My practice sentences
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

    <custom-footer></custom-footer>

  </div>

</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'

export default {
  name: 'user-profile',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {
      loadingPage: true,
      userData: {},
      userLists: [],
      recentWordsList: []
    }
  },
  computed: {
    signedIn () {
      return this.$root.$data.store.retrieveSignInStatus()
    },
    userCreatedDate () {
      var d = new Date(this.userData['date_created'])
      let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
      let mo = new Intl.DateTimeFormat('en', { month: 'long' }).format(d)
      return `${mo}, ${ye}`
    }
  },
  async mounted () {
    if (!this.signedIn) {
      this.$root.$data.store.storeSessionData(null, null)
      this.$router.push('/signin')
    } else {
      try {
        await this.getUserData()
        await this.getRecentWords()
      } catch (error) {
        console.error(error)
      }
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
                .get(process.env.VUE_APP_API_URL + 'user_data', {
                  headers: {
                    'Authorization': session.getIdToken().getJwtToken()
                  }
                }
                )
                .then((response) => {
                  // console.log(response.data)
                  this.userData = response.data['user_data']
                  this.userLists = response.data['lists']
                  resolve(this.userData, this.userLists)
                })
            }
          })
        } else {
          console.log('User not found.')
          reject(Error('User not found.'))
        }
      })
    },
    async getRecentWords () {
      return new Promise((resolve, reject) => {
        try {
          return axios
            .get(process.env.VUE_APP_API_URL + 'history'
            )
            .then((response) => {
              // Create list with just the words from the most recent day
              // Add unique id - HSKLevel1simplified (temp fix before switching everything to list ids)
              let recentWordsListUnfiltered = []
              for (let [key, value] of Object.entries(response.data)) {
                // only copying value, not the entire dict
                let simplifiedEntry = Object.assign({}, value.slice(-1)[0])
                simplifiedEntry['UniqueListId'] = simplifiedEntry['ListId'].concat('simplified')
                simplifiedEntry['CharacterSet'] = 'simplified'
                let traditionalEntry = Object.assign({}, value.slice(-1)[0])
                traditionalEntry['UniqueListId'] = traditionalEntry['ListId'].concat('traditional')
                traditionalEntry['CharacterSet'] = 'traditional'
                recentWordsListUnfiltered.push(simplifiedEntry)
                recentWordsListUnfiltered.push(traditionalEntry)
              }
              // Remove spaces from user's list names (temp fix before switching everything to list ids)
              // Create unique id - HSKLevel1simplified
              let userListsUniqueIds = []
              for (let i = 0; i < this.userLists.length; i++) {
                if (this.userLists[i]['character_set'] === 'simplified') {
                  userListsUniqueIds.push(this.userLists[i]['list_name'].concat('simplified').replaceAll(' ', ''))
                }
                if (this.userLists[i]['character_set'] === 'traditional') {
                  userListsUniqueIds.push(this.userLists[i]['list_name'].concat('traditional').replaceAll(' ', ''))
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
    }
  }
}
</script>

<style lang="scss" scoped>
  .row {
    padding: .5rem,
  }
  .header-row {
    padding-top: 1rem;
  }
  .btn-settings {
    cursor: pointer;
    background-color: #b7b7b7;
    border-color: #b7b7b7;
    color: white;
    // border-radius: .5em;
    // min-width: 200px;
    // margin: .5em;
  }
  .card {
    border-radius: 1rem;
    margin: 0.75rem;
    border: none;
  }
  .user-date {
    font-size: 0.9rem;
  }
  .card-button {
    margin: .5rem;
    background-color: #fe4c00;
    border-color: #fe4c00;
    color: white;
    border-radius: .25rem;
    // padding: .375rem .75rem;
  }
  .set-profile-text {
    color: orangered;
    text-decoration: underline;
  }
  .set-profile-text:hover {
    cursor: pointer;
  }
  .daily-word-link {
    color: orangered;
    text-decoration: underline;
  }
  .daily-word-link:hover {
    cursor: pointer;
  }
  .emoji-card {
    border-radius: 5rem;
    width: 4rem;
    height: 4rem;
  }
  .user-emoji {
    margin: 0;
  }
  .user-subtext {
    font-size: 0.9rem;
  }
  .vertical-align {
    display: flex;
    align-items: center;
  }
</style>
