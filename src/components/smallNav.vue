<template>

  <div id="small-nav">
    <div class="jumbotron jumbotron-fluid bg-img">
      <div class="container header-nav-container">
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

export default {
  name: 'smallNav',
  // data () {
  // },
  methods: {
  }
}
</script>

<style scoped>
  @media only screen and (min-width: 500px) and (max-width: 2000px) {

  }

  @media only screen and (min-width: 0px) and (max-width: 500px) {
    .header-link {
      text-align: center;
      font-size: 2.25rem;
    }
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

  .header-link {
    color: white;
    padding: 0;
  }

  .header-link:hover {
    color: white;
  }
</style>
