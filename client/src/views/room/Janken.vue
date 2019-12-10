<template>
  <div>
    <vk-button-group>
      <vk-button @click="sendHand('goo')" v-bind:type="guType">グー</vk-button>
      <vk-button @click="sendHand('choki')" v-bind:type="chokiType">チョキ</vk-button>
      <vk-button @click="sendHand('par')" v-bind:type="parType">パー</vk-button>
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
      limit: null,
      aiko: false
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

      await setTimeout(janken(), Date.now()-this.limit)
    } catch (err) {
      console.log(err)
    }
    return false
  },
  sockets: {
    async aiko () {
      this.aiko = true
      // ここまでのhandも含めたplayersの情報をうまい具合に読み込みたい(わからん)
      await mounted()
    },
    jankenWinner (unparsedData) {
      const data = JSON.parse(unparsedData)
    }
  },
  methods: {
    sendHand (hand) {
      this.hand = hand
      const sendObj = {
        roomId: this.roomId,
        players: this.players,
        token: localStorage.getItem('token'),
        hand: this.hand
      }
      await this.$socket.emit('sendHand',JSON.stringify(sendObj))
    },
    async janken () {
      const sendObj = {
        token: localStorage.getItem('token'),
        roomId: this.roomId
      }
      const result = await this.$socket.emit('janken',JSON.stringify(sendObj))
    }
  computed: {
    gooType () {
      return hand === 'goo' ? 'primary' : ''
    },
    chokiType () {
      return hand === 'choki' ? 'primary' : ''
    },
    parType () {
      return hand === 'par' ? 'primary' : ''
    }
  }
}
</script>