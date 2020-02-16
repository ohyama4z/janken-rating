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
        <input class="uk-input uk-form-width-medium uk-form-large" type="password" v-model="password">
        </div>
      </div>

      <div class="uk-margin">
        <recaptcha
          sitekey="6LehQ9kUAAAAALdZ7utScbCtawhl52F_bHXbEEtc"
          :loadRecaptchaScript="true"
          type="checkbox"
          v-on:verify="verified"
        ></recaptcha>
      </div>

      <div v-if="isFailedLogin" class="uk-text-center@s">
        ログインに失敗しました
      </div>

      <button
        v-on:click="login()"
        v-bind:disabled="!isVerified"
        class="uk-button uk-button-primary"
      >ログイン</button>
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
import VueRecaptcha from 'vue-recaptcha'

export default {
  name: 'login',
  data () {
    return {
    name: '',
    password: '',
    token: '',
    isFailedLogin: false,
    isVerified: false,
    recaptchaRes: null
    }
  },
  components: {
    recaptcha: VueRecaptcha
  },
  methods: {
    login () {
      const sendObj = {
        name: this.name,
        password: this.password,
        recaptcha: this.recaptchaRes
      }
      const successed = true
      const method = 'POST'
      const body = Object.keys(sendObj).map((key)=>key+"="+encodeURIComponent(sendObj[key])).join("&")
      //console.log(body,sendObj)
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      }
      fetch('/api/login', { method, headers, body }).then(res => res.json()).then(res => {
        //console.log(res.status)
        if (res.status === 'ok') {
          this.token = res.token,
          localStorage.setItem('token', this.token)
          //console.log(this.token)
          this.$router.push('home')
        } else {
          this.isFailedLogin = true
        }
      })
      // }).then(() => {
      //   return fetch(sfdaslfjldfjskwg)
      // }).then(res => {
      //   syori
        
      // }).catch(e => {
      //   //console.log(e)
      //   this.isFailedLogin = true
      // })
      return false
    },
    verified (response) {
      this.isVerified = true
      this.recaptchaRes = response
    }
  }
}

</script>