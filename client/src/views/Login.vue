<template>
  <div class="login">
    <div class="uk-form-horizontal login-form">
      ログインフォーム
      <div class="uk-margin">
        <label class="uk-form-label" for="form-horizontal-text">名前✒️</label>
          <div class="uk-form-controls">
              <input class="uk-input uk-form-width-medium uk-form-large" type="text" v-model="name">
          </div>
      </div>
      <div class="uk-margin"> 
        <label class="uk-form-label" for="form-horizontal-text">パスワード🔐</label>
        <div class="uk-form-controls">
        <input class="uk-input uk-form-width-medium uk-form-large" type="text" v-model="password">
        </div>
      </div>
      <button v-on:click="login()" class="uk-button uk-button-primary">ログイン</button>
    </div>
  </div>
</template>
<style>
  /* .login{ margin: center } */
  .login-form {
    width: 70%;
    margin: auto;
  }
</style>

<script>

export default {
  name: 'login',
  data () {
    return {
    name: '',
    password:''
    }
  },
  methods: {
    login () {
      const sendObj = {
        name: this.name,
        password: this.password
      }
      const method = 'POST'
      const body = Object.keys(sendObj).map((key)=>key+"="+encodeURIComponent(sendObj[key])).join("&")
      console.log(body,sendObj)
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      }
      fetch('/api/login', { method, headers, body }).then((res) => res.json()).then (res => {
        console.log(res.status)
        if (res.status === 'ok') {
          // console.log('ログインできたぞおおおおおおおお')
        } else {
          // console.log('ログイン出来なかった(´・ω・｀)')
        }
      })
      return false
    }
  }
}

</script>