<template>

  <!-- Renders and conditionally formats wordHistory -->
  <div class="card border-secondary shadow-sm">
    <div class="card-header d-flex w-100 justify-content-between">
      <h5>
        Level {{ card.Word['HSK Level'] }}
      </h5>
      <small class="text-muted">
        {{ card.Date }}
      </small>
    </div>
    <div class="card-body">
      <p class="card-text">
        {{ card.Word.Word }}
      </p>
      <p class="card-text">
        {{ card.Word.Pronunciation }}
      </p>
      <p class="card-text">
        {{ card.Word.Definition }}
      </p>
      <!-- <p class="card-text italicized" v-if="card.Word['HSK Level'] < 3">
        <a href="https://www.yellowbridge.com/chinese/sentsearch.php?word=">
          Example sentences
        </a>
      </p>
      <p class="card-text italicized" v-if="card.Word['HSK Level'] > 3">
        <a href="https://fanyi.baidu.com/#zh/en/" + card.Word.Word>
          Example sentences
        </a>
      </p> -->
    </div>
  </div>

</template>

<script>
export default {
  name: 'wordHistory',
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
    // Call my vocab history API that returns word history for given level
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .card {
    margin: 0.75rem;
    box-shadow: 0.5rem;
    min-height: 300px;
    padding: 0;
  }

  @media only screen and (min-width: 401px) and (max-width: 960px) {
  .card {
    min-height: 0;
    }
  }

  .card-body {
    padding: 1.5rem;
  }

  .italicized {
    font-style: italic;
    font-size: 0.75rem;
  }

  /* .card-header {
    background-color: white;
    color: orangered;
  } */

</style>
