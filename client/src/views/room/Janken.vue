<template>
  <div>
    <vk-button-group>
      <vk-button @click="sendHand('goo')" v-bind:type="gooType">グー</vk-button>
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
        await this.initialized()
    } catch (err) {
      console.log(err)
    }
    return false
  },
  sockets: {
    async aiko () {
      this.aiko = true
      // ここまでのhandも含めたplayersの情報をうまい具合に読み込みたい(わからん)
      await this.initialized()
    },
    finished () {
      this.aiko = false
      this.$router.push(`/rooms/${this.roomId}/result`)
    }
  },
  methods: {
    async initialized () {
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
        const res = await response.json()
        console.log(res)
        if (res.status !== 'ok') {
          throw new Error('ばーか')
        }
        this.players = res.players
        this.limit = res.info.startTime
        this.$socket.emit()
        console.log(new Date(Date.now()),new Date(this.limit))
      } catch (err) {
        console.log(err)
      }
    },
    async sendHand (hand) {
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
  },
  computed: {
    gooType () {
      return this.hand === 'goo' ? 'primary' : ''
    },
    chokiType () {
      return this.hand === 'choki' ? 'primary' : ''
    },
    parType () {
      return this.hand === 'par' ? 'primary' : ''
    }
  }
}
</script>