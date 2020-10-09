<template>
  <div id="app">

    <router-view/>

  </div>
</template>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Oswald');
  @import url('https://fonts.googleapis.com/css?family=Open+Sans');
  // @import url('https://fonts.googleapis.com/css?family=Noto+Sans+SC');
  @import url('https://fonts.googleapis.com/css?family=Ma+Shan+Zheng');

  #app {
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
  }

  // .h1, h2, h3, h4 {
  //   font-family: 'Oswald', sans-serif;
  //   font-weight: 400;
  // }

  .logo-character {
    font-family: 'Ma Shan Zheng', sans-serif;
    font-weight: 900;
  }
  

  .logo-title {
    font-family: 'Oswald', sans-serif;
    font-weight: 400;
  }

  .logo-subtitle {
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
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
    overflow-x: hidden;
    // overflow-y: hidden;
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

  // Desktop
  @media only screen and (min-width: 500px) and (max-width: 2000px) {
  }

  // Mobile
  @media only screen and (min-width: 0px) and (max-width: 500px) {
    body {
      margin-bottom: 52px;
    }
  }

</style>
