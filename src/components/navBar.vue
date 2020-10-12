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
        </ul>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'navBar',
  data () {
    return {}
  },
  methods: {
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
