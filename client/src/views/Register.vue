<template>
  <div>
    <div v-if="!hasRegistered">
      名前を入力してね！(~10文字)<br>
      <input type="text" v-model="name"><br>
      <div v-if="!isNameOK">
        名前が長すぎるぞ！！！！！
      </div>
      新しいパスワードを入力してね！(8~64文字)<br>
      <input type="text" v-model="password"><br>
      <div v-if="!isPassOK">
        パスワードの長さをどうにかしろ！！！！！
      </div>
      <div v-if="errs.internalServerErr">
        サーバーの処理が失敗しました<br>
        後ほどお試しください
      </div>
      <button v-on:click="register()">アカウント登録</button>
    </div>
    <div v-else>
      ようこそ{{name}}さん！！！！<br>
      プロフィールを設定しよう！<br>
      ひとことコメントを入力しよう(しろ)！<br>
      <input type="text" v-model="comment">
      <!-- アイコンを設定しよう！<br>
      <input type="file" v-model="icon"> -->
    </div>
  </div>
</template>

<script>

export default {
  name: 'register',
  data () {
    return {
      name: '',
      password: '',
      hasRegistered: false,
      errs: {
        nameLenErr: false,
        passLenErr: false,
        internalServerErr: false
      }
    }
  },
  methods: {
    register () {
      const sendObj = {
        //受けとったデータを代入
        name: this.name,
        password: this.password
      }
      const method = 'POST'
      //http の後の？の部分
      const body = Object.keys(sendObj).map((key)=>key+"="+encodeURIComponent(sendObj[key])).join("&")
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      }
      fetch('./register', { method, headers, body }).then((res) => res.json()).then (res => {
        if (res.status === 'ok') {
          this.hasRegistered = true
        } else {
          // passwordとnameがオーバーしてる時のエラー
          this.errs[res.err] = true
        }
      })
    }
  },
  computed: {
    isNameOK () {
      return this.name <= 10 || !this.errs.nameLenErr
    },
    isPassOK () {
      return (this.password >= 8 && this.password <= 64) || !this.errs.passLenErr
    }
  }
}

</script>