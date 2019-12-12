<template>
  <div>
    <a class="uk-link-muted" href="/home">ホームに戻る</a>
    <div class="uk-width-1-2 uk-margin-auto uk-margin-medium">
      <vk-card v-on:click="createRoom()" type="primary">
        <vk-card-title>対戦ルーム作成</vk-card-title>
        <p>新しく対戦部屋を作ります</p>
      </vk-card>
    </div>
    <div class="uk-width-1-2 uk-margin-auto uk-margin-medium">
      <vk-card v-on:click="joinRoom()" type="primary">
        <vk-card-title>入室</vk-card-title>
        <p>ルームIDを入力</p>
        <input class="uk-input uk-form-width-medium uk-form-large" type="number" v-model="enterCode" placeholder="1234">
      </vk-card>
    </div>
    <div v-if="isFailedCreated" class="uk-text-center@s">部屋の作成に失敗しました、時間を置いて再度お試しください</div>
  </div>
</template>

<script>
  export default {
    name: 'rooms',
    data () {
      return{
        enterCode: null,
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
          enterCode: this.enterCode
        }
        const method = 'POST'
        const body = Object.keys(sendObj).map((key)=>key+"="+encodeURIComponent(sendObj[key])).join("&")
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
        fetch(`/api/rooms/${sendObj.enterCode}/join`, { method, headers, body }).then((res) => res.json()).then (res => {
          if (res.status === 'ok') {
            this.$router.push(`/rooms/${res.roomId}/waiting`)
          } else {
            //console.log('ばか')
          }
        }).catch(err => {
          //console.log('あほ')
        })
      }
    }
  }
</script>