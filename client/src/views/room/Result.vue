<template>
  <div class="uk-flex  uk-flex-center">
    <div>you can see match result here,</div>
    <div><vk-button @click="backHome()" type="primary">back home vue</vk-button></div>
  </div>
</template>

<script>
export default {
  name: 'result',
  data () {
    return {
      players: [],
      roomId: null
    }
  },
  methods: {
    backHome () {
      this.$router.push('/home')
    }
  }
}
</script>