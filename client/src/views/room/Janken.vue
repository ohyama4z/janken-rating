<template>
  <div>
    <vk-button-group>
      <vk-button v-bind:type="primary">グー</vk-button>
      <vk-button v-bind:type="primary">チョキ</vk-button>
      <vk-button v-bind:type="primary">パー</vk-button>
    </vk-button-group>
  </div>
</template>

<script>
export default {
  name: 'matcing',
  data () {
    return {
      players: [],
      roomId: null,
      hand: null,
      limit: null
    }
  },
  async mounted () {
    try{
      this.roomId = this.$route.params.roomId
      const sendObj = {
        roomId: this.roomId,
        token: localStorage.getItem('token')
      }
      const method = 'GET'
      // const body = Object.keys().map((key)=>key+"="+encodeURIComponent()).join("&")
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Authorization': localStorage.getItem('token')
      }
      const response = await fetch(`/api/rooms/${this.roomId}/matching`, { method, headers })
      const res = response.json()
      if (res.status !== 'ok') {
        throw new Error('ばーか')
      }
      this.players = res.players
      this.limit = res.info.startTime
     this.$socket.emit()
      await setTimeout(janeken(hand), Date.now()-this.limit)
    } catch (err) {
      console.log(err)
    }
    return false
  },
  sockets: {
    sendHand (unparsedData) {
      this.jankenData = JSON.parse(unparsedData)
    }
  },
  methods: {
    sendHand () {
      const sendObj = {
        roomId: this.roomId,
        players: this.players,
        token: localStorage.getItem('token'),
        hand: this.hand
      }
      this.$socket.emit('sendHand',JSON.stringify(sendObj))
    }
  },
  computed: {
    guType () {
      if(this.hand)
    }
  }
}
</script>