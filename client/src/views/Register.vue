<template>
  <div>
    <form v-if="!hasRegistered" class="uk-form-stacked uk-margin-large">
    <!-- <div v-if="!hasRegistered"> -->
      <div class="uk-margin">
        <label class="uk-form-label">名前を入力してね！(~10文字)</label>
        <div class="uk-form-controls">
          <input
            type="text"
            class="uk-input uk-form-width-medium"
            v-bind:class="nameClass"
            v-model="name"
            v-on:input="checkIfEndNamePending"
            v-on:blur="isNameValPending = false"
          >
          <div class="uk-text-danger">
            <div v-if="nameStatus === 'invalidLen'">
              名前ダッッッッッッッサ！！！！！！
            </div>
            <div v-if="nameStatus === 'empty'">
              せめてなんか書けよ！！！！！！
            </div>
          </div>
        </div>
      </div>

      <div class="uk-margin">
        <label class="uk-form-label">新しいパスワードを入力してね！(8~64文字)</label>
        <div class="uk-form-controls">
          <input 
            type="password"
            class="uk-input uk-form-width-medium"
            v-model="password"
            v-bind:class="passClass"
            v-on:input="checkIfEndPassPending"
            v-on:blur="isPassValPending = false"
          ><br>
          <div class="uk-text-danger">
            <div v-if="passStatus === 'tooLong'">
              お前それ覚えれるの？？？？
            </div>
            <div v-if="passStatus === 'tooShort'">
              せきゅりてぃ意識もって❤️
            </div>
          </div>
        </div>
      </div>

      <div class="uk-margin">
        <vk-button 
          type="primary"
          v-on:click="register()"
          v-bind:disabled="!(isNameOk && isPassOk)"
        >
          アカウント登録
        </vk-button>
        <div v-if="errs.internalServerErr">
          サーバーの処理が失敗しました。
          後ほどお試しください。
        </div>
      </div>
    <!-- </div> -->
    </form>
    <!-- 
    <div v-else>
      ようこそ{{name}}さん！！！！<br>
      プロフィールを設定<br><br>
      ひとことコメント<br>
      <input type="text" v-model="comment">
      アイコンを設定しよう！<br>
      <input type="file" v-model="icon">
    </div> -->
  </div>
</template>

<script>
import { Button/*, ButtonLink */} from 'vuikit/lib/button'


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
      },
      canRegisterName: true,
      isNameValPending: true,
      isPassValPending: true

    }
  },
  components: {
    VkButton: Button,
    // VkButtonLink: ButtonLink
  },
  methods: {
    checkIfEndNamePending () {
      if (this.name.length > 0) this.isNameValPending = false
    },
    checkIfEndPassPending () {
      if (this.password.length >= 8) this.isPassValPending = false
    },
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
      fetch('/api/register', { method, headers, body }).then((res) => res.json()).then (res => {
        console.log(res)
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
    isNameOk () {
      return this.name.length >= 1 && this.name.length <= 10 && !this.errs.nameLenErr
    },
    nameStatus () {
      if (this.isNameValPending) return 'pending'
      if (!this.canRegisterName) return 'duplicated'
      if (this.isNameOk) return 'ok'
      if (this.name.length === 0) return 'empty'
      if (this.name.length > 10) return 'invalidLen'
      return 'ng'
    },
    nameClass () {
      if (this.nameStatus === 'pending') return ''
      if (this.nameStatus === 'ok') return 'uk-form-success'
      return 'uk-form-danger'
    },
    isPassOk () {
      return this.password.length >= 8 && this.password.length <= 64 && !this.errs.passLenErr
    },
    passStatus () {
      if (this.isPassValPending) return 'pending'
      if (this.isPassOk) return 'ok'
      if (this.password.length < 8) return 'tooShort'
      if (this.password.length > 64) return 'tooLong'
      return 'ng'
    },
    passClass () {
      if (this.passStatus === 'pending') return ''
      if (this.passStatus === 'ok') return 'uk-form-success'
      return 'uk-form-danger'
    }
  }
}

</script>