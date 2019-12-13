<template>
  <div>
    <div class="uk-text-center uk-text-bold">出す手を選ぼう！</div>
    <div v-if="aiko" class="uk-text-center uk-text-warning uk-text-large">あいこ！！ もう一度選びなおそう！</div>
    <div class="uk-flex uk-flex-center">
      <vk-button-group>
        <vk-button @click="sendHand('goo')" v-bind:type="gooType">グー</vk-button>
        <vk-button @click="sendHand('choki')" v-bind:type="chokiType">チョキ</vk-button>
        <vk-button @click="sendHand('par')" v-bind:type="parType">パー</vk-button>
      </vk-button-group>
    </div>

    <div
      class="uk-width-1-2 uk-margin-auto uk-margin-medium"
      v-for="player in players"
      v-bind:key="player.id"
    >
      <div class="uk-text-center">{{player.name}}</div>
      <div class="uk-flex uk-flex-center">
        <div v-if="player.icon">
          <img class="uk-border-circle" width="80" height="80" :src="player.icon">
        </div>
        <div v-else>
          <vk-icon class="uk-border-circle" width="40" height="40" icon="user"></vk-icon>
        </div>
        <div v-if="aiko">
          <img width="80" height="80" :src="player.handImg">
          {{ player.hand }}
        </div>
      </div>
    </div>
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
    aiko (unparsed) {
      console.log('unparsedData!!!!', unparsed)
      this.players = JSON.parse(unparsed).players // とかで受け取れるようにサーバ側で実装すれば良さそう
      this.aiko = true
      this.hand = null
      // できればここまでのhandも含めたplayersの情報をうまい具合に読み込みたい(わからん)
    },
    finished (unparsed) {
      this.players = JSON.parse(unparsed).players
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
        // console.log(res)
        if (res.status !== 'ok') {
          throw new Error('ばーか')
        }
        this.players = res.players
        this.limit = res.info.startTime
        // console.log(new Date(Date.now()),new Date(this.limit))
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
        players: this.players,
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