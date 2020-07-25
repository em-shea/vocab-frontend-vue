<template>

  <div id="small-nav">

    <char-set-toggle></char-set-toggle>
    <div class="jumbotron jumbotron-fluid bg-img">
      <div class="container">
        <div class="row">
          <div class="col title">
            <h1 class="display-6">
              <router-link class="header-link nav-link" :to="{ name: 'home'}">
                Daily Chinese Vocab
              </router-link>
            </h1>
            <!-- <p class="lead">Keep up on 中文 with daily HSK vocabulary in your inbox.</p> -->
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import characterSetToggle from '@/components/characterSetToggle.vue'

export default {
  name: 'smallNav',
  components: {
    'char-set-toggle': characterSetToggle
  },
  // data () {
  // },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    }
  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .jumbotron {
    padding: 0.8rem 2rem
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

  .header-link {
    color: white;
  }

  .header-link:hover {
    color: white;
  }
</style>
