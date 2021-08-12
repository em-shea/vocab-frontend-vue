<template>
  <div id="user-quiz">

    <small-header></small-header>

    <div class="container">
      <div class="row">
        <div class="col">
          User quiz tracking
        </div>
      </div>
      <div class="row">
        <div class="col">
          <list-dropdown :userLists="userLists"></list-dropdown>
        </div>
      </div>
    </div>

    <custom-footer></custom-footer>

  </div>

</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'
import listDropdown from '@/components/listDropdown.vue'

export default {
  name: 'user-quiz',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter,
    'list-dropdown': listDropdown
  },
  data () {
    return {
    }
  },
  computed: {
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>

</style>
