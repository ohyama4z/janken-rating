<template>
  <div>
    <router-link class="uk-link-muted" to="home">ホームに戻る</router-link>
    <h1
      class="uk-text-large uk-text-bold uk-text-center"
      v-bind:class="{
        'uk-text-success': myData.result === 'Win',
        'uk-text-danger': myData.result === 'Lose'
      }"
    >You {{ myData.result }}!!</h1>
    <div class="
      uk-flex
      uk-flex-column
      uk-flex-center
      uk-align-center
    ">
      <div
        v-for="player in players"
        v-bind:key="player.id"
        v-bind:class="{
          'uk-flex-first': myData.playerId === player.id
        }"
        class="uk-margin"
      >
        <vk-card
          class="uk-width-1-2@m uk-width-1-1@s uk-margin-auto uk-margin-top"
        >
          <div slot="header">
            <vk-grid gutter="small" class="uk-flex-middle">
              <div class="uk-width-auto">
                <div v-if="player.icon">
                  <img class="uk-border-circle" width="120" height="120" :src="player.icon">
                </div>
                <div v-else>
                  <vk-icon class="uk-border-circle" width="40" height="40" icon="user"></vk-icon>
                </div>
              </div>
              <div class="uk-width-expand">
                <vk-card-title class="uk-margin-remove-bottom uk-margin-remove-top">{{ player.name }}</vk-card-title>
              </div>
            </vk-grid>
          </div>
          <div class="uk-flex-middle">
            <div>
              <p class="uk-text-large">Rate: {{ player.oldRate }} ⇒ {{ player.rate }}</p>
            </div>
            <div class="uk-flex-first">
              <img v-if="player.hand==='goo'" width="80" height="80" src="/goo.png">
              <img v-if="player.hand==='choki'" width="80" height="80" src="/choki.png">
              <img v-if="player.hand==='par'" width="80" height="80" src="/par.png">
            </div> 
          </div>
        </vk-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'result',
  data () {
    return {
      players: [],
      myData: {},
      roomId: null,
      playerName: null,
    }
  },
  async mounted () {
    this.roomId = this.$route.params.roomId
    const method = 'GET'
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Authorization': localStorage.getItem('token')
    }
    const response = await fetch(`/api/rooms/${this.roomId}/result`, { method, headers })
    const res = await response.json()
    if (res.status !== 'ok') {
      throw new Error('あho')
    }
    this.players = res.players
    this.myData = res.myData
  },
}
</script>