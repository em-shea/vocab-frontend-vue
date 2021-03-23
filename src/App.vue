<template>
  <div id="app">

    <router-view/>

  </div>
</template>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Oswald');
  @import url('https://fonts.googleapis.com/css?family=Open+Sans');
  @import url('https://fonts.googleapis.com/css?family=Ma+Shan+Zheng');

  // Colors
  // Orange red: #fe4c00
  // Orange: #ff8500
  // Gray: #6c757d

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

  .logo-title, .logo-title-2 {
    font-family: 'Oswald', sans-serif;
    font-weight: 400;
  }

  .logo-subtitle {
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
  }

  .tooltip {
  display: block !important;
  z-index: 10000;
  opacity: 1;

  .tooltip-inner {
    background: black;
    color: white;
    border-radius: .5em;
    padding: 5px 10px 4px;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
    z-index: 1;
  }

  &[x-placement^="top"] {
    margin-bottom: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="bottom"] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="right"] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^="left"] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }

  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  }
}

  .narrow-footer {
    max-width: 880px;
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
