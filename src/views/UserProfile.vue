<template>
  <div id="user-profile">

    <small-header></small-header>

    <div class="container">
      <div class="row">
        <div class="col">
          <div class="card mx-auto" style="width: 18rem;">
            <div class="card-body">
              <h4 class="card-title">Your profile</h4>
              <h5 class="card-title">{{ displayName }}</h5>
              <p class="card-text">This is your profile page!</p>
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">Subscribed lists</li>
              <li class="list-group-item">Created lists</li>
              <li class="list-group-item">Quiz scores</li>
            </ul>
            <div class="card-body">
              <a href="#" class="card-link">Profile settings</a>
            </div>
          </div>
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
  name: 'user-profile',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {
      displayName: '小蔡 🐼'
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
    }
  },
  methods: {
  }
}
</script>

<style>

</style>
