<template>
  <div id="edit-user-info">
    <small-header></small-header>
    <div class="container">
        <div class="row">
            <div class="col">
                <h5 class="title">
                    Profile settings
                </h5>
            </div>
        </div>
    </div>
    <custom-footer></custom-footer>
  </div>
</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'
// import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'

export default {
  name: 'edit-user-info',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {
      userData: {}
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
</style>
