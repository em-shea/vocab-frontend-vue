<template>
    <div id="large-header">

        <div class="jumbotron jumbotron-fluid bg-img">
            <div class="container">
                <div class="row float-right">
                    <div class="btn-group float-right btn-group-toggle" data-toggle="buttons">
                        <label class="btn btn-toggle-char" title="Simplified Chinese" :class='{"active": charSet === "simplified"}' @click="$emit('update:charSet', 'simplified')">
                            <input class="char-toggle-text" type="radio" name="options" id="option1" autocomplete="off" checked> 简体字 <br> Simplified
                        </label>
                        <label class="btn btn-toggle-char" :class='{"active": charSet === "traditional"}' @click="$emit('update:charSet', 'traditional')">
                            <input class="char-toggle-text" type="radio" title="Traditional Chinese" name="options" id="option2" autocomplete="off"> 繁體字 <br> Traditional
                        </label>
                    </div>
                </div>
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
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

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

</style>
