<template>
  <div id="answer-challenge">

    <small-header></small-header>

    <div class="container main-container">
      <div class="row">
        <div class="col">
          <p>One-time sign-in link sent! Please check your email and click the button to sign in.</p>
          <p>The sign-in link will expire in 3 minutes. If you did not receive an email, please double check that you entered your email correctly. Please <a href="mailto:help@haohaotiantian.com">reach out</a> if you are still having trouble logging in.</p>
          <div class="form-group">
            <!-- <label for="answerChallengeCode"></label> -->
            <input type="text" v-model="code" class="form-control" id="answerChallengeCode" placeholder="One-time sign-in code">
          </div>
          <button type="button" class="btn btn-light code-btn" @click="resendCode()">Resend code</button>
          <button type="button" @click="submitCode()" class="btn btn-dark code-btn float-right">Submit</button>
        </div>
      </div>
      <div class="row error-message">
        <div class="col" v-if="invalidCode">
          <p>This code is either incorrect or has expired. Please double check the code, or click the button above to resend a code.</p>
        </div>
        <div class="col" v-if="codeResent">
          <p>Code resent! Please check your email.</p>
        </div>
      </div>
    </div>

    <custom-footer></custom-footer>

  </div>

</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'
import { Auth } from 'aws-amplify'
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js'

export default {
  name: 'answer-challenge',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {
      username: null,
      session: null,
      code: null,
      codeInputted: null,
      cognitoUser: CognitoUser,
      invalidCode: false,
      codeResent: false
    }
  },
  computed: {
  },
  mounted () {
    this.getLocalSessionData()
    this.getCognitoUser()
    this.getQueryStringParams()
  },
  methods: {
    // https://stackoverflow.com/questions/52787498/cognito-paswordless-auth-via-link
    // Get cognito user and session data from local storage
    // Info needed from Auth.signIn in order to Auth.sendCustomChallengeAnswer
    getLocalSessionData () {
      let sessionData = this.$root.$data.store.retrieveSessionData()
      console.log(sessionData)
      if (sessionData === null) {
        // No user info stored in local storage
        this.$router.push('/signin')
      } else {
        this.username = sessionData.username
        this.session = sessionData.session
      }
    },
    getQueryStringParams () {
      if (this.$route.query.code) {
        this.code = this.$route.query.code
        console.log('code in params')
        this.submitCode()
      }
    },
    getCognitoUser () {
      // console.log('username', this.username)
      // console.log('session', this.session)
      let userPoolData = {
        UserPoolId: process.env.VUE_APP_USER_POOL_ID,
        ClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID,
        Storage: localStorage
      }
      try {
        let userPool = new CognitoUserPool(userPoolData)
        this.cognitoUser = new CognitoUser({
          Username: this.username,
          Pool: userPool,
          Storage: localStorage
        })
      } catch (err) {
        console.log(err)
      }
      this.cognitoUser.Session = this.session
      // console.log('session2', this.cognitoUser.Session)
    },
    submitCode () {
      this.answerChallenge()
    },
    async answerChallenge () {
      try {
        // console.log('answer challenge cognito user', this.cognitoUser)
        await Auth.sendCustomChallengeAnswer(this.cognitoUser, this.code)
      } catch (err) {
        console.log('Error authenticating user', err)
        if (err.message === 'Invalid session for the user.') {
          this.invalidCode = true
          return
        } else {
          throw err
        }
      }
      // Test if user was authenticated.
      try {
        await Auth.currentSession()
      } catch (err) {
        console.log('Error retrieving user session', err)
        this.invalidCode = true
        return
      }
      console.log('signed in')
      this.$root.$data.store.updateSignInStatus(true)
      this.$router.push('/profile')
    },
    async resendCode () {
      console.log('resending')
      this.code = null
      this.codeResent = false
      this.invalidCode = false
      try {
        this.cognitoUser = await Auth.signIn(this.username)
      } catch (err) {
        console.log(err)
      }
      this.codeResent = true
    }
  }
}
</script>

<style scoped>
@media only screen and (min-width: 500px) {
  .main-container {
    max-width: 880px;
    padding: 1em 0em;
  }
}
.main-container {
  margin-top: 2rem;
}
.code-btn {
  min-width: 120px;
}
.error-message {
  padding: 1rem 0rem;
}
</style>
