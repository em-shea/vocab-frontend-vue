<template>
  <div id="sign-up-confirmation">

    <small-header></small-header>

    <div class="container main-container">
      <div class="row">
        <div class="col">
          <h5 class="main-title">成功！You're subscribed to daily vocab emails.</h5>
          <p>
            You should receive a confirmation email which includes a sign-in link. This link will take you to your profile, where you can manage your vocab list subscriptions, review previous daily words, and take vocab quizzes.
          </p>
          <p>
            The sign-in link expires after 3 minutes, but you can always request a new one on the <router-link :to="{ name: 'sign-in'}">sign-in page</router-link>.
          </p>
          <p>
            Thanks for subscribing! Follow<a href="https://twitter.com/haohaotiantian_"><p class="fa fa-twitter social-icons pl-2"></p> Haohaotiantian</a> on Twitter to learn about new features we're building.
          </p>
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
  name: 'sign-up-confirmation',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {}
  }
}
</script>

<style scoped>
.main-container {
  margin-top: 1rem;
}
.main-title {
  padding: 1rem 0rem;
}
</style>
