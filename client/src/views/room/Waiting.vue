<template>
  <div>
    <div class="uk-text-center@s">enter code : {{ enterCode }}</div>
    <vk-button 
      type="primary"
      v-on:click="startGame()"
      v-bind:disabled="players.length<2 || !leader"
      class="uk-align-center"
    >ゲーム開始</vk-button>
    <div 
      class="uk-width-1-2 uk-margin-auto uk-margin-medium"
      v-for="player in players"
      v-bind:key="player.id"
    >

      <vk-card class="uk-width-1-2@m uk-align-center">
        <div slot="header">
          <vk-grid gutter="small" class="uk-flex-middle">
            <div class="uk-width-auto">
              <div v-if="player.icon">
                <img class="uk-border-circle" width="160" height="160" :src="player.icon">
              </div>
              <div v-else>
                <vk-icon class="uk-border-circle" width="40" height="40" icon="user"></vk-icon>
              </div>
            </div>
            <div class="uk-width-expand">
              <vk-label v-if="player.leader" slot="badge">room leader</vk-label>
              <vk-card-title class="uk-margin-remove-bottom uk-margin-remove-top">{{ player.name }}</vk-card-title>
              <p class="uk-text-meta uk-margin-remove-top">rate : {{ player.rate }}</p>
            </div>
          </vk-grid>
        </div>
        <div>
          <p>{{ player.comment }}</p>
        </div>
      </vk-card>

      <!-- <vk-card type="secondary">
        <div v-if="player.leader">room leader🚩</div>
        <vk-card-title>{{ player.name }}</vk-card-title>
        <p>rating : {{ player.rate }}</p>
        <p>{{ player.comment }}</p>
      </vk-card> -->
    </div>
  </div>
</template>

<script>
  export default {
    name: 'waiting',
    data () {
      return {
        players: [],
        roomId: null,
        leader: false,
        enterCode: null
      }
    },
    mounted () { // ページが読み込まれた時
        // サーバにアクセスして、情報を取ってくる
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
      fetch(`/api/rooms/${this.roomId}/waiting`, { method, headers }).then((res) => res.json()).then (res => {
        if (res.status !== 'ok') {
          return Promise.reject(new Error('ばーか'))
        }
        this.players = res.players
        this.enterCode = res.enterCode
        this.leader = res.leader
        // this.$set(data, 'players', res.players)
        this.$socket.emit('watchRoom',JSON.stringify(sendObj))
        // this.leader = res.leader
        return
      }).catch((err) => {
        //console.log(err)
      })
      return false
    },
    sockets : {
      playerData (unparsedData) {
        this.players = JSON.parse(unparsedData)
        // console.log(unparsedData)
      },

      startGame () {
        this.$router.push(`/rooms/${this.roomId}/matching`)
      }
    },
    methods: {
      startGame () {
        const sendObj = {
          roomId: this.roomId,
          players: this.players,
          token: localStorage.getItem('token'),
        }
        this.$socket.emit('startGame',JSON.stringify(sendObj))
        // console.log(this.roomId.matchURL)
      }
    }
  }
</script>