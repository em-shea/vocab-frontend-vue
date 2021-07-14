<template>
  <div id="user-profile">

    <small-header></small-header>

    <div class="container">
      <div class="row" v-if="userData['user_data']['user_alias'] === 'Not set'">
        <div class="col">
          <h3 class="userAliasHeader">{{ userData['user_data']['email_address'] }}</h3>
          <p class="mb-2 text-muted">Set a profile name</p>
        </div>
      </div>
      <div class="row" v-if="userData['user_data']['user_alias'] !== 'Not set'">
        <div class="col">
          <h3 class="userAliasHeader">{{ userData['user_data']['user_alias'] }}</h3>
          <!-- <p class="mb-0 text-muted">{{ userData['user_data']['user_alias_pinyin'] }}</p> -->
          <p class="mb-0 text-muted">xiǎo wáng</p>
          <!-- <p class="mb-2 text-muted">Studying since {{ userData['user_data']['date_created'] }}</p> -->
          <p class="mb-2 text-muted">Studying since July, 2018</p>
          <!-- 新手， 大二， -->
        </div>
      </div>
      <div class="row bg-light">
        <div class="col-12">
          Today's words
        </div>
        <div class="col-md-12 col-lg-6" v-for="(value, key) in recentWordsList" :key=key>
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <h5 class="card-text">{{ value['Word']['Word'] }}</h5>
              <p class="card-text">{{ value['Word']['Pronunciation'] }}</p>
              <p class="card-text">{{ value['Word']['Definition'] }}</p>
            </div>
          </div>
          <p class="text-muted">{{ key }}
            <router-link :to="{ name: 'quiz'}">Quiz</router-link>
            <router-link :to="{ name: 'history'}">Review</router-link>
          </p>
          <!-- <router-link :to="{path:'/election/1/voter', query: {voterId: 5}}">
            Quiz
          </router-link> -->
        </div>
      </div>
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
      <div class="row pt-3">
        <div class="col-6">
          <button type="button" class="btn btn-light" v-on:click="$router.push('/manage-lists');">
            Manage lists
          </button>
        </div>
        <div class="col-6">
          <button type="button" class="btn btn-light" v-on:click="$router.push('/profile-settings');">
            Profile settings
          </button>
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
      userData: {},
      userLists: [
        'HSK Level 3',
        'HSK Level 6'
      ],
      recentWordsList: {
        'HSK Level 3': {
          'Word': {
            'Definition': 'how?; how about?; how was it?; how are things?',
            'HSK Level': '1',
            'Word': '怎么样',
            'Word-Traditional': '怎麼樣',
            'Pronunciation': 'zěn me yàng'
          },
          'Date': '2021-07-05',
          'ListId': 'HSKLevel1'
        },
        'HSK Level 6': {
          'Word': {
            'Definition': 'dawn; daybreak',
            'HSK Level': '6',
            'Word': '黎明',
            'Word-Traditional': '黎明',
            'Pronunciation': 'lí míng'
          },
          'Date': '2021-07-04',
          'ListId': 'HSKLevel6'
        }
      }
    }
  },
  computed: {
    signedIn () {
      return this.$root.$data.store.retrieveSignInStatus()
    }
  },
  mounted () {
    if (!this.signedIn) {
      this.$root.$data.store.storeSessionData(null, null)
      this.$router.push('/signin')
    } else {
      try {
        this.getUserData()
        // this.getRecentWords() // Need to fix word history API to return words by List name (with spaces) or Id
      } catch (error) {
        console.error(error)
      }
    }
  },
  methods: {
    getUserData () {
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
            console.log('IdToken: ' + session.getIdToken().getJwtToken())
            return axios
              .get(process.env.VUE_APP_API_URL + 'user_data', {
                headers: {
                  'Authorization': session.getIdToken().getJwtToken()
                }
              }
              )
              .then((response) => {
                console.log(response.data)
                this.userData = response.data
              })
          }
        })
      } else {
        console.log('User not found.')
      }
    },
    getRecentWords () {
      return axios
        .get(process.env.VUE_APP_API_URL + 'history'
        )
        .then((response) => {
          this.recentWordsList = response.data
          console.log(this.recentWordsList)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  .orange-button {
    cursor: pointer;
    border-radius: .5em;
    background-color: #fe4c00;
    border-color: #fe4c00;
    color: white;
    min-width: 200px;
    margin: .5em;
  }

  .row {
    padding: .5rem,
  }
  .card {
    border-radius: 1rem;
    margin: 0.75rem;
    border: none;
  }
</style>
