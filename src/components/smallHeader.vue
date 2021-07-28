<template>

  <div id="small-header">
    <div class="jumbotron jumbotron-fluid bg-img">
      <div class="container header-nav-container">
        <div class="row m-2">
          <div class="col-xs-6 col">
            <h1 class="display-6">
              <router-link class="logo-character float-left" :to="{ name: 'home'}">
                好
              </router-link>
            </h1>
          </div>
          <div class="col-6 toggle">
            <span class="oi oi-menu oi-icon toggle-icon" title="oi-menu" @click="showNav = !showNav"></span>
          </div>
        </div>
        <div class="row mx-2 navbar-row justify-content-center" :class="{ 'visible': showNav }">
          <ul class="navbar p-0" id="navbar">
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active : this.$route.name === 'home' }" :to="{ name: 'home'}">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active : this.$route.name === 'quiz' }" :to="{ name: 'quiz'}">Quiz</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active : this.$route.name === 'history' }" :to="{ name: 'history'}">Review</router-link>
            </li>
            <li class="nav-item" v-if="!this.signedIn && this.$route.name !== 'sign-in'">
              <router-link class="nav-link" :to="{ name: 'sign-in'}">Sign in</router-link>
            </li>
            <li class="nav-item" v-if="this.signedIn">
              <router-link class="nav-link" :class="{ active : this.$route.name === 'user-profile' }" :to="{ name: 'user-profile'}">Profile</router-link>
            </li>
            <li class="nav-item" v-if="this.signedIn">
              <div class="nav-link" @click="signOut()">Sign out</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

</template>

<script>

export default {
  name: 'smallHeader',
  data () {
    return {
      showNav: false
    }
  },
  computed: {
    mobileDevice () {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    },
    signedIn () {
      return this.$root.$data.store.retrieveSignInStatus()
    }
  },
  mounted () {
    console.log(this.signedIn)
  },
  methods: {
    signOut () {
      console.log('sign out')
      this.$root.$data.store.storeSessionData(null, null)
      this.$root.$data.store.updateSignInStatus(false)
      if (this.$route.name === 'user-profile') {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
  @media only screen and (min-width: 500px) and (max-width: 2000px) {
    .header-nav-container {
      max-width: 880px;
      padding-bottom: .5rem;
      /* padding-left: 2em;
      padding-right: 2em; */
    }
    .nav-link {
      padding: 0rem 2rem;
    }
  }

  @media only screen and (min-width: 0px) and (max-width: 500px) {
    .header-nav-container {

    }
    .nav-link {
      padding: 0.5rem 0.5rem;
    }
  }

  .header-link {
    text-align: center;
    font-size: 2.25rem;
  }

  .header-link:hover {
    color: white;
  }

  .logo-character {
    text-align: center;
    font-size: 2.6rem;
    border: 3px solid rgba(255, 255, 255, 1);
    border-radius: 20%;
    background-color: rgba(255, 255, 255, 1);
    color: #ff5700;
    padding: 0;
    line-height: 1em;
    box-shadow: 0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12);
  }

  .logo-character:hover {
    text-decoration: none;
  }

  .logo-title {
    margin-left: -.3rem;
  }

  .toggle {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .navbar {
    list-style-type: none;
    margin-bottom: 0;
    margin-top: 0;
    padding-bottom: 0;
    padding-top: 0;
  }

  .navbar-row {
    overflow: hidden;
    transition: max-height 0.4s ease-in-out;
    max-height: 0;
  }

  .navbar-row.visible {
    height: auto;
    max-height: 50px;
  }

  .nav-link {
    color: white;
  }

  .nav-link:hover {
    color: lightgray;
    cursor: pointer;
    text-decoration: underline;
  }

  .nav-link.active {
    color: lightgray;
  }

  .navbar-toggler {
    float: right;
  }

  .toggle-icon {
    color: white;
    font-size: 25px;
  }

  .toggle-icon:hover {
    cursor: pointer;
  }

  .header-nav-container{
    padding-top: 0;
  }

  .jumbotron {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .btn-toggle-char {
    background-color: transparent;
    border-color: white;
    color: white;
  }

  .btn-toggle-char:hover {
    cursor: pointer;
    color: rgb(83, 79, 74);
  }

  .active.btn-toggle-char {
    background:rgba(255,255,255,0.25);
  }

  .char-toggle-text {
    font-size: 0.9rem;
  }

</style>
