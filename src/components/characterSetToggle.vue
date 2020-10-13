<template>
    <div id="char-set-toggle">
        <div class="container" :class="getWidth()">
            <div class="row">
                <div class="col">
                    <button class="btn btn-link charSet-btn float-right" title="Traditional Chinese" :class='{"active": characterSet === "traditional"}' @click="$root.$data.store.changeCharacterSet('traditional')">Traditional (繁体字)</button>
                    <button class="btn btn-link charSet-btn float-right" title="Simplified Chinese" :class='{"active": characterSet === "simplified"}' @click="$root.$data.store.changeCharacterSet('simplified')">Simplified (简体字)</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
  name: 'char-set-toggle',
  props: {
    charSetWidth: String
  },
  data () {
    return {}
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    }
  },
  methods: {
    getWidth () {
      if (this.charSetWidth === 'narrow') {
        return 'narrow'
      }
    }
  }
}
</script>

<style scoped>

  .charSet-btn {
    color: gray;
  }

  .charSet-btn.active {
    color: #fe4c00;
  }

  .charSet-btn:hover {
    color: hsla(16, 100%, 40%, 1);
    cursor: pointer;
  }

  .container.narrow {
    max-width: 880px;
  }

</style>
