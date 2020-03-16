<template>
    <div id="large-header">
        <div class="container">
            <div class="row">
                <div class="col">
                    <button class="btn btn-link float-right" title="Traditional Chinese" :class='{"active": characterSet === "traditional"}' @click="$root.$data.store.changeCharacterSet('traditional')">Traditional (繁体字)</button>
                    <button class="btn btn-link float-right" title="Simplified Chinese" :class='{"active": characterSet === "simplified"}' @click="$root.$data.store.changeCharacterSet('simplified')">Simplified (简体字)</button>
                </div>
            </div>
        </div>
        <div class="jumbotron jumbotron-fluid bg-img">
            <div class="container">
                <div class="row">
                    <div class="col title">
                        <h1 class="display-6">Daily Chinese Vocab</h1>
                        <p class="lead">Keep up on 中文 with daily HSK vocabulary in your inbox.</p>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>

export default {
  name: 'large-header',
  props: [
    'charSet'
  ],
  data () {
    return {}
  },
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

  .btn-toggle-char {
    background-color: transparent;
    border-color: white;
    color: orangered;
    font-size: small;
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
