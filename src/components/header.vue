<template>
  <div id="large-header">
    <char-set-toggle></char-set-toggle>
    <div class="jumbotron jumbotron-fluid bg-img">
      <div class="container logo-container">
        <div class="row logo-row">
          <div class="col logo-character">
            好
          </div>
          <div class="col logo-text-col">
            <div class="row">
              <div class="col-12 logo-title">
                HAOHAOTIANTIAN
              </div>
              <div class="col-12 logo-subtitle">
                chinese language learning
              </div>
            </div>
          </div>
            <!-- <div class="col title">
                <h1 class="display-6">Daily Chinese Vocab</h1>
                <p class="lead">Keep up on 中文 with daily HSK vocabulary in your inbox.</p>
            </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import characterSetToggle from '@/components/characterSetToggle.vue'

export default {
  name: 'large-header',
  components: {
    'char-set-toggle': characterSetToggle
  },
  data () {
    return {}
  },
  methods: {
  }
}
</script>

<style scoped>
  .logo-character {
    font-size: 7.8rem;
    line-height: 1.15;
    flex-grow: 0;
    padding: 0;
  }

  .logo-title {
    font-size: 4.5rem;
    margin-bottom: -1rem;
  }

  .logo-subtitle {
    font-size: 1.5rem;
    letter-spacing: 0.45rem;
    padding-left: 1.1rem;
  }

  .logo-container {
    padding-top: 0;
  }

  .logo-row {
    justify-content: center;
  }

  .logo-text-col{
    flex-grow: 0;
    white-space: nowrap;
    padding: 0;
    margin-left: -1em;
  }

  .jumbotron {
    padding: 3rem;
  }


  @media only screen and (min-width: 500px) and (max-width: 2000px) {
  
  }

  @media only screen and (min-width: 0px) and (max-width: 500px) {
    body {
      margin-bottom: 52px;
    }
  }

</style>
