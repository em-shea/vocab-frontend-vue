<template>
  <div id="sign-up-confirmation">

    <small-header></small-header>

    <div class="container main-container">
      <div class="row">
        <div class="col">
          <h5 class="main-title">成功！You're subscribed to daily Chinese vocab emails.</h5>
          <p>
            You should receive a confirmation email. Follow the sign-in link to view your profile, manage your vocab list subscriptions, review previous daily words, and take vocab quizzes.
          </p>
          <p>
            The sign-in link expires after 3 minutes, but you can always request a new one on the <router-link :to="{ name: 'sign-in'}">sign-in page</router-link>.
          </p>
          <p>
            Follow<a href="https://twitter.com/haohaotiantian_"><p class="fa fa-twitter social-icons pl-2"></p> Haohaotiantian</a>
          </p>
        </div>
      </div>
    </div>

    <custom-footer :footerWidth="footerWidth"></custom-footer>

  </div>

</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'

export default {
  name: 'sign-up-confirmation',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {
      footerWidth: 'narrow'
    }
  }
}
</script>

<style scoped>
@media only screen and (min-width: 500px) {
  .main-container {
    max-width: 55rem;
    padding: 1em 15px;
  }
}
.main-container {
  margin-top: 1rem;
}
.main-title {
  padding: 1rem 0rem;
}
</style>
