<template>

  <!-- Renders and conditionally formats wordHistory -->
  <div class="card border-secondary shadow-sm">
    <div class="card-header main-card d-flex w-100 justify-content-between" v-on:click="clickDescription()">
      <h5>
        Level {{ card.Word['HSK Level'] }}
      </h5>
      <small class="text-muted">
        {{ card.Date }}
      </small>
    </div>
    <div class="card-body main-card" v-on:click="clickDescription()">
      <p v-if="characterSet === 'simplified'" class="card-text">
        {{ card.Word.Word }}
      </p>
      <p v-if="characterSet === 'traditional'" class="card-text">
        {{ card.Word['Word-Traditional'] }}
      </p>
      <p class="card-text">
        {{ card.Word.Pronunciation }}
      </p>
      <p class="card-text" :class="{ 'truncate' : !clicked }">
        {{ card.Word.Definition }}
      </p>
    </div>
    <div class="card-body link-card">
      <p class="card-text link-text" v-if="card.Word['HSK Level'] <= 3">
        <a :href="'https://www.yellowbridge.com/chinese/sentsearch.php?word=' + card.Word.Word">
          Example sentences
        </a>
      </p>
      <p class="card-text link-text" v-if="card.Word['HSK Level'] > 3">
        <a :href="'https://fanyi.baidu.com/#zh/en/' + card.Word.Word">
          Example sentences
        </a>
      </p>
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
      clicked: false
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    }
  },
  methods: {
    clickDescription () {
      console.log('clicking description', this.clicked)
      if (this.clicked === false) {
        this.clicked = true
      } else {
        this.clicked = false
      }
    }
  }
}
</script>

<style scoped>
  .card {
    margin: 0.75rem;
    box-shadow: 0.5rem;
    min-height: 250px;
    padding: 0;
  }

  @media only screen and (min-width: 0px) and (max-width: 800px) {
    .card {
      min-height: 0;
    }
  }

  @media only screen and (min-width: 575px) {
    .truncate {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .main-card {
      cursor: pointer;
    }

    .a.link-text {
      cursor: pointer;
    }
  }

  .link-text {
    font-size: 0.75rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .link-card {
    padding-top: 0rem;
    padding-bottom: 1.5rem;
  }

  /* .card-header {
    background-color: white;
    color: orangered;
  } */

</style>
