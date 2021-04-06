<template>
  <div id="sign-up-confirmation">

    <small-header></small-header>

    <div class="container">Sign Up Confirmation</div>

    <custom-footer></custom-footer>

  </div>

</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'

export default {
  name: 'sign-up-confirmation',
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
