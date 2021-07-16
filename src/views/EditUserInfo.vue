<template>
  <div id="edit-user-info">
    <small-header></small-header>
    <div class="container">
      <div class="row">
        <div class="col">
          <button type="button" class="btn btn-light" @click="$router.push('/profile')">
            <span class="oi oi-chevron-left oi-icon menu-icon" title="oi-chevron-left"></span>
            Back
          </button>
        </div>
      </div>
      <div class="row">
          <div class="col">
              <h5 class="title">
                  Profile settings
              </h5>
          </div>
      </div>
      <div class="row">
        <div class="col">
          <form>
            <div class="form-group row">
              <label for="staticEmail" class="col-sm-2 col-form-label">Email</label>
              <div class="col-sm-10">
                <input type="text" readonly class="form-control-plaintext" id="staticEmail" :value="userData['user_data']['email_address']">
              </div>
            </div>
            <div class="form-group row">
              <label for="staticEmail" class="col-sm-2 col-form-label">Username</label>
              <div class="col">
                <select class="form-control" v-model="userAliasPlaceholder" @change="updateUserData()" id="exampleFormControlSelect1" >
                  <option v-for="alias in userAliasOptions" :key="alias['character']" :value="alias">{{ alias['character'] }} {{ alias['pinyin'] }}</option>
                </select>
              </div>
              <div class="col-3">
                <select class="form-control" v-model="userData['user_data']['user_alias_emoji']" @change="setUserData()" id="exampleFormControlSelect1">
                  <option v-for="emoji in emojiOptions" :key="emoji" :value="emoji">{{ emoji }}</option>
                </select>
              </div>
              <!-- <div class="col">
                <button type="button" class="btn btn-light">Submit</button>
              </div> -->
            </div>
            <div class="form-group row">
              <label for="inputPassword" class="col-sm-2 col-form-label">Character set preference</label>
              <div class="col-sm-10">
                <select class="form-control" id="exampleFormControlSelect1" v-model="userData['user_data']['character_set_preference']" @change="setUserData()">
                  <option value="simplified">Simplified</option>
                  <option value="traditional">Traditional</option>
                </select>
                <small id="emailHelp" class="form-text text-muted">This sets your default character set on the website, but will not affect your list subscriptions.</small>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <custom-footer></custom-footer>
  </div>
</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'
import emojiOptions from '@/assets/emojiOptions.json'
import userAliasOptions from '@/assets/userAliasOptions.json'
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'

export default {
  name: 'edit-user-info',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {
      userAliasPlaceholder: {},
      userData: {
        user_data: {}
      },
      userAliasOptions: userAliasOptions,
      emojiOptions: emojiOptions,
      // userAliasOptions: [
      //   { 'character': '小王', 'pinyin': 'xiǎo wáng' },
      //   { 'character': '小陈', 'pinyin': 'xiǎo chén' },
      //   { 'character': '小琳', 'pinyin': 'xiǎo lín' },
      //   { 'character': '小蔡', 'pinyin': 'xiǎo cài' }
      // ],
      // emojiOptions: [
      //   '🕺',
      //   '📙',
      //   '🌶',
      //   '🌴',
      //   '☀️'
      // ]
    }
  },
  async mounted () {
    await this.getUserData()
    this.setUserAliasPlaceholder()
  },
  computed: {},
  methods: {
    setUserAliasPlaceholder () {
      this.userAliasPlaceholder = {
        'user_alias': this.userData['user_data']['user_alias'],
        'user_alias_pinyin': this.userData['user_data']['user_alias_pinyin']
      }
      console.log('update user placeholder', this.userAliasPlaceholder)
    },
    updateUserData () {
      console.log('update user data', this.userAliasPlaceholder)
      this.userData['user_data']['user_alias'] = this.userAliasPlaceholder['user_alias']
      this.userData['user_data']['user_alias_pinyin'] = this.userAliasPlaceholder['user_alias_pinyin']
    },
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
              console.log('IdToken: ' + session.getIdToken().getJwtToken())
              return axios
                .get(process.env.VUE_APP_API_URL + 'user_data', {
                  headers: {
                    'Authorization': session.getIdToken().getJwtToken()
                  }
                })
                .then((response) => {
                  console.log(response.data)
                  console.log(session.getIdToken().getJwtToken())
                  this.userData = response.data
                  resolve(this.userData)
                })
            }
          })
        } else {
          console.log('User not found.')
          reject(Error('User not found'))
        }
      })
    },
    setUserData () {
      let requestBody = {
        'user_alias': this.userData['user_data']['user_alias'],
        'user_alias_pinyin': this.userData['user_data']['user_alias_pinyin'],
        'user_alias_emoji': this.userData['user_data']['user_alias_emoji'],
        'character_set_preference': this.userData['user_data']['character_set_preference']
      }
      console.log(requestBody)
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
              .post(process.env.VUE_APP_API_URL + 'update_user',
                requestBody,
                {
                  headers: {
                    'Authorization': session.getIdToken().getJwtToken()
                  }
                })
              .then((response) => {
                console.log(response.data)
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
