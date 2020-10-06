<template>
    <div id="large-header">
        <char-set-toggle></char-set-toggle>
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

</style>
