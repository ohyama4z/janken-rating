<template>
  <div>
    <div class="uk-width-1-2 uk-margin-auto uk-margin-medium">
      <button v-on:click="createRoom()">
        <vk-card type="primary">
          <vk-card-title>対戦ルーム作成</vk-card-title>
          <p>新しく対戦部屋を作ります</p>
        </vk-card>
      </button>
    </div>
    <div class="uk-width-1-2 uk-margin-auto uk-margin-medium">
       <input class="uk-input uk-form-width-medium uk-form-large" type="text" v-model="roomId">
      <button v-on:click="joinRoom()">
        <vk-card type="primary">
          <vk-card-title>入室</vk-card-title>
          <p>ルームIDを入力して既存の部屋に入ります</p>
        </vk-card>
      </button>
    </div>
    <div v-if="isFailedCreated">部屋の作成に失敗しました、時間を置いて再度お試しください</div>
  </div>
</template>

<script>
  export default {
    name: 'rooms',
    data () {
      return{
        roomId: null,
        isFailedCreated: false
      }
    },
    methods: {
      createRoom () {
        const sendObj = {
          token: localStorage.getItem('token')
        }
        const method = 'POST'
        const body = Object.keys(sendObj).map((key)=>key+"="+encodeURIComponent(sendObj[key])).join("&")
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
        fetch('/api/rooms', { method, headers, body }).then((res) => res.json()).then (res => {
          if (res.status === 'ok') {
            this.$router.push(`/rooms/${res.id}/waiting`)
          } else {
            this.isFailedCreated = true
          }
        })
        return false
      },
      joinRoom () {
        const sendObj = {
          token: localStorage.getItem('token'),
          roomId: this.roomId
        }
        const method = 'POST'
        const body = Object.keys(sendObj).map((key)=>key+"="+encodeURIComponent(sendObj[key])).join("&")
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
        fetch(`/api/rooms/${roomId}/join`, { method, headers, body }).then((res) => res.json()).then (res => {
        })
      }
    }
  }
</script>