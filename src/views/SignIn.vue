<template>
  <div id="sign-in">

    <small-header></small-header>

    <div class="container main-container">
      <div class="row">
        <div class="col">
          <p>To sign in, enter your email to receive a one-time sign-in link.</p>
          <p>Not signed up yet? Head to the <router-link :to="{ name: 'home'}">home page</router-link>, select a vocab list, and click subscribe.</p>
        </div>
      </div>
      <div>
      <div class="form-group">
        <label for="exampleInputEmail1">Email address</label>
        <input type="email" v-model="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email address">
      </div>
      <button v-if="!sendingCode" type="button" @click="sendCode()" class="btn btn-dark">
        Send sign-in link
      </button>
      <button v-if="sendingCode" type="button" class="btn btn-dark">
        <span  class="spinner-border spinner-border-sm mb-1 mx-1" role="status" aria-hidden="true"></span>
        Sending sign-in link
      </button>
      </div>
      <div class="row" v-if="invalidEmail">
        <div class="col">
          <p>Please enter a valid email.</p>
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
import { CognitoUser } from 'amazon-cognito-identity-js'

export default {
  name: 'sign-in',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {
      cognitoUser: CognitoUser,
      email: null,
      emailValidated: null,
      emailInputted: null,
      invalidEmail: false,
      sendingCode: false
    }
  },
  mounted () {
    this.getEmailParam()
  },
  methods: {
    async sendCode () {
      this.sendingCode = true
      if (this.validateEmail(this.email) === true) {
        try {
          this.cognitoUser = await Auth.signIn(this.email)
        } catch (err) {
          console.log(err)
        }
        // console.log('cognito user', this.cognitoUser)
        // console.log('email sent')
        // this.$root.$data.store.storeSessionData(this.cognitoUser)
        this.$root.$data.store.storeSessionData(this.cognitoUser.username, this.cognitoUser.Session)
        this.$router.push('/verification')
      } else {
        this.sendingCode = false
        this.invalidEmail = true
      }
    },
    validateEmail () {
      this.invalidEmail = false
      if (this.email === null) {
        this.emailInputted = false
        return false
      } if (this.email.indexOf('@') === -1) {
        this.emailValidated = false
        return false
      } else {
        this.emailValidated = true
        return true
      }
    },
    getEmailParam () {
      if (this.$route.query.email) {
        this.email = this.$route.query.email
      }
    }
  }
}
</script>

<style scoped>
  @media only screen and (min-width: 500px) and (max-width: 2000px) {
    .container {
      max-width: 55rem;
      padding: 1em 15px;
    }
  }
  .main-container {
    margin-top: 2rem;
  }
</style>
