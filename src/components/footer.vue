<template>
  <div id="custom-footer">

    <footer class="footer">
      <div class="container" :class="getFooterWidth()">
        <span class="align-text-bottom">
          Haohaotiantian
          <a href="https://twitter.com/haohaotiantian_" class="fa fa-twitter social-icons pl-2"></a>
          <a href="https://github.com/em-shea/vocab" class="fa fa-github social-icons pl-2"></a>
          <!-- <span class="oi oi-heart oi-icon pl-2" title="oi-heart"></span> -->
        </span>
      </div>
    </footer>

  </div>
</template>

<script>
export default {
  name: 'customFooter',
  props: {
    footerWidth: String
  },
  // data () {
  // },
  methods: {
    getFooterWidth () {
      if (this.footerWidth === 'narrow') {
        return 'narrow-footer'
      }
    }
  }
}
</script>

<style scoped>
  .footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    color: white;
    /* Set the fixed height of the footer here */
    /* height: 50px; */
    /* line-height: 50px; Vertically center the text there */
    padding: 0.5rem;
    background: rgb(255,76,0);
    background: linear-gradient(90deg, rgba(255,76,0,1) 0%, rgba(255,145,0,1) 100%);
  }

  .narrow-footer {
    max-width: 55rem;
    padding: 0rem 1.5rem;
  }

  .social-icons {
    color: white;
    font-size: 18px;
  }

  .social-icons:hover {
    cursor: pointer;
    text-decoration: none;
  }
</style>
