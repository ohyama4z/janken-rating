<template>
  <div>
    <h1 class="uk-text-center@s uk-text-primary">Profile</h1>
    <button >
    <vk-card class="uk-width-1-2@m uk-align-center">
        <div slot="header">
          <vk-grid gutter="small" class="uk-flex-middle">
            <div class="uk-width-auto">
              <div v-if="player.icon">
                <img class="uk-border-circle" width="40" height="40" src="player.icon">
              </div>
              <div v-else>
                <vk-icon class="uk-border-circle" width="40" height="40" icon="user"></vk-icon>
              </div>
            </div>
            <div class="uk-width-expand">
              <vk-card-title class="uk-margin-remove-bottom uk-margin-remove-top">{{ player.name }}</vk-card-title>
              <p class="uk-text-meta uk-margin-remove-top">rate : {{ player.rate }}</p>
            </div>
          </vk-grid>
        </div>
        <div>
          <p>{{ player.comment }}</p>
        </div>
    </vk-card>
  </div>
</template>

<script>

export default {
  name: 'profile',
  data () {
    return {
      player: [],
      token: localStorage.getItem(token),
      editData: {
        comment: null,
        icon: null
      }
    }
  },
  components: {
    
  },
  mounted () {
    const sendObj = {
      token: this.token
    }
    const method = 'GET'
    const body = Object.keys(sendObj).map((key)=>key+"="+encodeURIComponent(sendObj[key])).join("&")
    const headers = { 
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Authorization': this.token
      }
    fetch('/api/profile', { method, headers, body }).then((res) => res.json()).then (res => {

    })
  },
  methods: {
    upload () {
      const sendObj = {
      editData: this.editData
    }
    const method = 'POST'
    const body = Object.keys(sendObj).map((key)=>key+"="+encodeURIComponent(sendObj[key])).join("&")
    const headers = { 
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Authorization': this.token
      }
    fetch('/api/profile', { method, headers, body }).then((res) => res.json()).then (res => {

    })
    }
  }
}
</script>