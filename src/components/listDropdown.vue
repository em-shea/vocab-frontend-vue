<template>
  <div id="list-dropdown">

    <div class="dropdown">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Dropdown button
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a class="dropdown-item" href="#" v-for="list in userLists" :key="list">
                {{ list }}
            </a>
        </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'listDropdown',
  props: {
    userLists: Array
  },
  data () {
  },
  methods: {

  }
}
</script>

<style scoped>

</style>
