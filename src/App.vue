<template>
  <div id="app">

    <router-view/>

  </div>
</template>

<style lang="scss">
// #app {
//   font-family: 'Avenir', Helvetica, Arial, sans-serif;
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
//   text-align: center;
//   color: #2c3e50;
// }
// #nav {
//   padding: 30px;
//   a {
//     font-weight: bold;
//     color: #2c3e50;
//     &.router-link-exact-active {
//       color: #42b983;
//     }
//   }
// }
  .sticky-top {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1020;
  }

  .anchor-target {
    position: relative;
    top: -50px;
  }

  .tab-content {
    height: 240px;
    overflow-y: scroll;
  }

  .bold {
    font-weight:bold;
  }

  html {
    position: relative;
    min-height: 100%;
  }

  body {
    /* Margin bottom by footer height */
    margin-bottom: 90px;
  }

  .footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    /* Set the fixed height of the footer here */
    /* height: 50px; */
    /* line-height: 50px; Vertically center the text there */
    background-color: #e9ecef;
    padding: 0.5rem;
  }

  .card-body {
    padding: 0.5rem;
  }

  .card {
    margin: 0.75rem;
    box-shadow: 0.5rem;
  }

  .bg-img {
    background: rgb(255,76,0);
    background: linear-gradient(90deg, rgba(255,76,0,1) 0%, rgba(255,145,0,1) 100%);
  }

  .jumbotron {
      color: white;
      margin-bottom: 0;
    }

  a {
    color: orangered;
  }

  a:hover {
    color: hsla(16, 100%, 40%, 1);
  }

  .nav-pills .nav-link.active, .nav-pills .show>.nav-link {
    color: #fff;
    background-color: orangered;
  }

  .sub-response {
    color: orangered;
  }

  img {
    margin-bottom: 1rem;
    width: 100%;
    max-width: 500px;
  }
</style>
