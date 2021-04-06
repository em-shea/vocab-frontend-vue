<template>
  <div id="sign-in">

    <small-header></small-header>

    <div class="container">
      <div class="row">
        <div class="col">
          <p>To sign in, we'll send a one-time code to your email. No need to remember a password!</p>
        </div>
      </div>
      <form>
        <div class="form-group">
          <label for="exampleInputEmail1">Email address</label>
          <input type="email" v-model="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email">
        </div>
        <button type="button" @click="sendCode()" class="btn btn-primary">Send one-time code to my email</button>
      </form>
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
      email: null,
      emailValidated: null,
      emailInputted: null,
      invalidEmail: false,
      cognitoUser: CognitoUser
    }
  },
  methods: {
    async sendCode () {
      if (this.validateEmail(this.email) === true) {
        this.cognitoUser = await Auth.signIn(this.email)
        console.log('email sent')
        // this.$router.push('/verification')
      } else {
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
    }
  }
}
</script>

<style>
  @media only screen and (min-width: 500px) and (max-width: 2000px) {
    .container {
      max-width: 880px;
      padding: 1em 0em;
    }
  }
</style>
