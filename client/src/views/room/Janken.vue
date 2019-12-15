<template>
  <div>
    <progress class="uk-progress" v-bind:value="progress" max="1"></progress>
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
          <img v-if="player.hand==='goo'" width="80" height="80" src="/goo.png">
          <img v-if="player.hand==='choki'" width="80" height="80" src="/choki.png">
          <img v-if="player.hand==='par'" width="80" height="80" src="/par.png">
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
      aiko: false,
      startedAt: null,
      finishAt: null,
      progress: 0
    }
  },
  async mounted () {
    try{
        this.roomId = this.$route.params.roomId
        const sendObj = {
          roomId: this.roomId,
          token: localStorage.getItem('token')
        }
        this.$socket.emit('getUpdateInfo', JSON.stringify(sendObj))
        this.hand = null
      // this.roomId = this.$route.params.roomId
      
      // const method = 'GET'
      // const headers = {
      //   'Accept': 'application/json',
      //   'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      //   'Authorization': localStorage.getItem('token')
      // }
      // const response = await fetch(`/api/rooms/${this.roomId}/matching`, { method, headers })
      // const res = await response.json()
      // if (res.status !== 'ok') {
      //   throw new Error('ばーか')
      // }
      // this.players = res.players
      // this.startedAt = res.info.startedAt
      // this.finishAt = res.info.finishAt
      
    } catch (err) {
      console.log(err)
    }
    return false
  },
  sockets: {
    updateInfo (unparsed) {
      const data = JSON.parse(unparsed)
      console.log('unparsedData!!!!', unparsed)
      this.players = data.players
      this.startedAt = data.startedAt
      this.finishAt = data.finishAt
      this.aiko = data.aiko
      
      this.updateProgress()
    },
    finished () {
      this.aiko = false
      this.$router.push(`/rooms/${this.roomId}/result`)
    }
  },
  methods: {
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
      await this.$socket.emit('janken',JSON.stringify(sendObj))
    },
    updateProgress () {
      this.progress = (Date.now() - this.startedAt)/(this.finishAt - 1000 - this.startedAt)
      if (this.progress >= 1) {
        return
      }
      // console.log(this.progress)
      setTimeout(this.updateProgress, 50)
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