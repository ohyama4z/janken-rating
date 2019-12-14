<template>
  <div>
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
      myData: {},
      roomId: null
    }
  },
  async mounted () {
    const method = 'GET'
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Authorization': localStorage.getItem('token')
    }
      const response = await fetch(`/api/rooms/${this.roomId}/result`, { method, headers })
      const res = await response.json()
      this.players = res.players
      this.myData = res.myData
  },
  methods: {
    backHome () {
      this.$router.push('/home')
    }
  }
}
</script>