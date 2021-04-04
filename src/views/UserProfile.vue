<template>
  <div id="user-profile">

    <small-header></small-header>

    <div class="container">User Profile</div>

    <custom-footer></custom-footer>

  </div>

</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'

export default {
  name: 'user-profile',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {}
  }
}
</script>

<style>

</style>
