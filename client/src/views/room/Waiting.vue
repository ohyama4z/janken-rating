<template>
  <div>
    <div>room id : {{ roomId }}</div>
    <div 
      class="uk-width-1-2 uk-margin-auto uk-margin-medium"
      v-for="i in players"
      v-bind:key="i"
    >
      <vk-card type="secondry">
        <div v-if="i.leader">room leader🚩</div>
        <vk-card-title>{{ i.name }}</vk-card-title>
        <p>rating : {{ i.rating }}</p>
        <p>{{ i.comment }}</p>
      </vk-card>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'waiting',
    data () {
      return {
        players: null,
        roomId: null
      }
    },

    mounted () { // ページが読み込まれた時
        // サーバにアクセスして、情報を取ってくる
      this.roomId = this.$route.params.roomId
      // const sendObj = {
      //   roomId: this.roomId,
      //   token: localStorage.getItem('token')
      // }
      const method = 'GET'
      // const body = Object.keys().map((key)=>key+"="+encodeURIComponent()).join("&")
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Authorization': localStorage.getItem('token')
      }
      fetch(`/api/rooms/${this.roomId}/waiting`, { method, headers }).then((res) => res.json()).then (res => {
        if (res.status !== 'ok') {
          return
        }
        // this.players = res.players
          this.$set(this.datas, 'players', res.players)
         this.$socket.emit('watchRoom',JSON.stringify(sendObj))
        return
      })
      return false
    },
    methods: {
      
    }
  }
</script>