<template>
  <div id="answer-challenge">

    <small-header></small-header>

    <div class="container">
      <form>
        <div class="form-group">
          <label for="answerChallengeCode">Check your email for a six digit code and enter it below. This code will expire in 5 minutes.</label>
          <input type="text" v-model="code" class="form-control" id="answerChallengeCode" placeholder="Enter one-time code">
        </div>
        <button type="button" class="btn btn-primary">Resend code</button>
        <button type="button" @click="submitCode()" class="btn btn-primary">Submit</button>
      </form>
      <div class="row" v-if="invalidCode">
        <div class="col">
          <p>Please double check that you've entered the right six digit code. If you're still having trouble, click 'Resend code' to receive a new one-time code.</p>
        </div>
      </div>
    </div>

    <custom-footer></custom-footer>

  </div>

</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'

export default {
  name: 'answer-challenge',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {
      code: null,
      codeInputted: null,
      codeValidated: null,
      invalidCode: false
    }
  },
  methods: {
    submitCode () {
      if (this.validateCode(this.code) === true) {
        this.$router.push('/profile')
      } else {
        this.invalidCode = true
      }
    },
    validateCode () {
      this.invalidCode = false
      if (this.code === null) {
        this.codeInputted = false
        return false
      } if (this.code.length !== 6) {
        this.codeValidated = false
        return false
      } else {
        this.codeValidated = true
        return true
      }
    }
  }
}
</script>

<style>

</style>
