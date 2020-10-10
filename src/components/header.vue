<template>
  <div id="large-header">
    <char-set-toggle></char-set-toggle>
    <div class="jumbotron jumbotron-fluid bg-img">
      <div class="container logo-container" v-if="mobileDevice === false">
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
        </div>
      </div>
      <div class="container mobile-logo-container" v-if="mobileDevice === true">
        <div class="row logo-row">
          <div class="col logo-character">
            好
          </div>
          <div class="col logo-text-col">
            <div class="row">
              <div class="col-12 logo-title">
                HAOHAO
              </div>
              <div class="col-12 logo-title-2">
                TIANTIAN
              </div>
            </div>
          </div>
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
  computed: {
    mobileDevice () {
      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        return true
      } else {
        return false
      }
    }
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
    .logo-title {
      font-size: 2.8rem;
      margin-bottom: -1.7rem;
    }

    .logo-title-2 {
      font-size: 2.8rem;
      margin-bottom: -1rem;
    }

    .logo-text-col{
      text-align: center;
    }

    .logo-character {
      font-size: 5.9rem;
      overflow: hidden;
      min-width: 85px;
      margin-right: 4px;
    }

    .jumbotron {
      padding: 1rem 1rem;
    }

    .mobile-subtitle {
      font-size: 1.5rem;
      letter-spacing: 0.45rem;
    }

    .mobile-logo-container {
      padding-top: 0;
    }

  }

</style>
