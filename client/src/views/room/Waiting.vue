<template>
  <table>
    
  </table>
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
      const sendObj = {
        roomId: this.roomId,
        token: localStorage.getItem('token')
      }
      const method = 'POST'
      const body = Object.keys(sendObj).map((key)=>key+"="+encodeURIComponent(sendObj[key])).join("&")
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      }
      fetch(`/api/rooms/${this.roomId}/waiting`, { method, headers, body }).then((res) => res.json()).then (res => {
        if (res.status !== 'ok') {
          return
        }
        this.players = res.players
         this.$socket.emit('watchRoom',JSON.stringify(sendObj))
        return
      })
      return false
    },
    methods: {
      
    }
  }
</script>