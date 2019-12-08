<template>
  <form class="uk-form-stacked">

    <div class="uk-margin uk-align-center">
      <div class="uk-form-label">Your Hand</div>
      <div class="uk-form-controls">
        <label><input class="uk-radio" type="radio" name="hand" value="gu-" v-model="hand"> グー</label><br>
        <label><input class="uk-radio" type="radio" name="hand" value="choki" v-model="hand"> チョキ</label><br>
        <label><input class="uk-radio" type="radio" name="hand" value="pa-" v-model="hand"> パー</label><br>
        <vk-button @click="sendHand()" type="primary">{{hand}}で確定</vk-button>
      </div>
    </div>

  </form>
</template>

<script>
export default {
  name: 'matcing',
  data () {
    return {
      players: [],
      pubURL: null,
      hand: null,
      jankenData: {}
    }
  },
  mounted () {
    this.pubURL = this.$route.params.pubURL
    const sendObj = {
      pubURL: this.pubURL,
      token: localStorage.getItem('token')
    }
    const method = 'GET'
    // const body = Object.keys().map((key)=>key+"="+encodeURIComponent()).join("&")
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Authorization': localStorage.getItem('token')
    }
    fetch(`/api/rooms/${this.pubURL}/matching`, { method, headers }).then((res) => res.json()).then (res => {
      if (res.status !== 'ok') {
        return Promise.reject(new Error('ばーか'))
      }
      this.players = res.players
      // this.$set(data, 'players', res.players)
      this.$socket.emit('watchRoom',JSON.stringify(sendObj))
      // this.leader = res.leader
      return
    }).catch((err) => {
      //console.log(err)
    })
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
        pubURL: this.pubURL,
        players: this.players,
        token: localStorage.getItem('token'),
        hand: this.hand
      }
      this.$socket.emit('sendHand',JSON.stringify(sendObj))
    }
  }
}
</script>