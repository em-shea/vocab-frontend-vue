<template>

  <div id="small-nav">

    <div class="jumbotron jumbotron-fluid bg-img">
      <div class="container">
        <div class="row">
          <div class="col title">
            <h1 class="display-6">Daily Chinese Vocab</h1>
            <!-- <p class="lead">Keep up on 中文 with daily HSK vocabulary in your inbox.</p> -->
          </div>
        </div>
      </div>
    </div>

    <div class="container bg-white sticky-top p-2">
      <div class="row justify-content-center">
        <ul class="nav" id="navbar">
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'home'}">Home</router-link>
          </li>
          <!-- <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'quiz'}">Practice</router-link>
          </li> -->
          <!-- <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'history'}">Word History</router-link>
          </li> -->
        </ul>
      </div>
    </div>

  </div>

</template>

<script>
export default {
  name: 'smallNav',
  props: {
    card: Object
  },
  // data () {
  // },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .jumbotron {
    padding: 0.8rem 2rem
  }
</style>
