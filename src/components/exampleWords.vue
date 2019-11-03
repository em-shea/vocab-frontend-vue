<template>

  <div>
    <!-- Receives each random word and renders -->
  </div>

</template>

<script>
export default {
  name: 'mtgCard',
  props: {
    card: Object
  },
  data () {
    return {
      transformed: false,
      clicked: false
    }
  },
  methods: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
