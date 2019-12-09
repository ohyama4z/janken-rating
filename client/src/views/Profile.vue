<template>
  <div>
    <h1 class="uk-text-center@s uk-text-primary">Profile</h1>
    
    <vk-card class="uk-width-1-2@m uk-align-center">
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
              <p class="uk-text-meta uk-margin-remove-top">rate : {{ player.rate }}</p>
            </div>
          </vk-grid>
        </div>
        <div>
          <p>{{ player.comment }}</p>
        </div>
    </vk-card>
    <vk-card type="blank" class="uk-width-1-2@m uk-align-center" hover>
      <vk-card-title>アイコン・コメントの変更</vk-card-title><br>
      <p>アイコンの変更</p>
      <div>
        <input
          type="file"
          id="avatar_name"
          accept="image/jpeg, image/png"
          @change="onImageChange"
        />
        <img class="uk-border-circle" width="200" height="200" :src="editData.icon">
      </div><br>
      <p>コメントを変更する</p>
      <div class="uk--margin">
        <input 
          type="text"
          class="uk-input uk-form-large"
          v-model="editData.comment"
          placeholder="コメントを入力"
        >
      </div><br>
      <vk-button @click="upload()" type="primary" class="uk-align-right">アップロード</vk-button>
    </vk-card>
  </div>
</template>

<script>

export default {
  name: 'profile',
  data () {
    return {
      player: {},
      token: localStorage.getItem('token'),
      editData: {
        comment: null,
        icon: null
      }
    }
  },
  components: {
    
  },
  mounted () {
    this.loadProfile()
  },
  methods: {
    getBase64 (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
    onImageChange (e) {
      const images = e.target.files || e.dataTransfer.files
      this.getBase64(images[0])
        .then(image => this.editData.icon = image)
        .catch(error => this.setError(error, '画像のアップロードに失敗しました。'))
    },
    upload () {
      const sendObj = {
      editData: this.editData
    }
    const method = 'POST'
    // const body = Object.keys(sendObj).map((key)=>key+"="+encodeURIComponent(sendObj[key])).join("&")
    const body = JSON.stringify(sendObj)
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': this.token
      }
    fetch('/api/profile', { method, headers, body }).then((res) => res.json()).then (response => {
      if (response.status === 'ok') {
        return true
      }
    }).then(() => {
      this.loadProfile()
    })
    },
    loadProfile () {
      const method = 'GET'
      // const body = Object.keys(sendObj).map((key)=>key+"="+encodeURIComponent(sendObj[key])).join("&")
      const headers = { 
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Authorization': this.token
        }
      fetch('/api/profile', { method, headers }).then((res) => res.json()).then (response => {
        this.player = response.profile
      })
    }
  }
}
</script>