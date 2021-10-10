<template>
  <div id="nav-bar">
    <div class="container bg-white p-2">
      <div class="row justify-content-center">
        <ul class="nav" id="navbar">
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active : this.$route.name === 'home' }" :to="{ name: 'home'}">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active : this.$route.name === 'quiz' }" :to="{ name: 'quiz'}">Quiz</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active : this.$route.name === 'history' }" :to="{ name: 'history'}">Review</router-link>
          </li>
          <li class="nav-item" v-if="!this.signedIn" >
            <router-link class="nav-link" :class="{ active : this.$route.name === 'sign-in' }" :to="{ name: 'sign-in'}">Sign in</router-link>
          </li>
          <li class="nav-item" v-if="this.signedIn">
            <router-link class="nav-link" :class="{ active : this.$route.name === 'user-profile' }" :to="{ name: 'user-profile'}">Profile</router-link>
          </li>
          <li class="nav-item" v-if="this.signedIn">
            <div class="nav-link" @click="signUserOut()">Sign out</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import shared from './../shared'

export default {
  name: 'navBar',
  data () {
    return {
      user: null
    }
  },
  computed: {
    signedIn () {
      if (this.user) {
        return true
      } else {
        return false
      }
    }
  },
  created () {
    this.getSignedInUser = shared.getSignedInUser
    this.signOut = shared.signOut
  },
  async mounted () {
    try {
      this.user = await this.getSignedInUser()
    } catch (error) {
      this.user = null
    }
  },
  methods: {
    signUserOut () {
      // console.log('signing out...')
      this.signOut()
      this.user = null
      if (this.$route.name !== 'home') {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
  .nav-link {
    color: #fe4c00;
  }

  .nav-link:hover {
    color: hsla(16, 100%, 40%, 1);
    cursor: pointer;
    text-decoration: underline;
  }

  .nav-link.active {
    color: hsla(16, 100%, 40%, 1);
  }

  @media only screen and (min-width: 500px) and (max-width: 2000px) {

  }

  @media only screen and (min-width: 0px) and (max-width: 500px) {

  }
</style>
