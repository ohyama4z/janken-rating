<template>
  <div>
    <div>じゃんけんレーティング</div>
    <div class="uk-width-1-2 uk-margin-auto uk-margin-medium">
      <router-link to="/rooms">
        <vk-card type="primary">
          <vk-card-title>JANKEN</vk-card-title>
          <p>オンライン上でじゃんけんができるぞ！どんどん勝ってレートを上げよう！</p>
        </vk-card>
      </router-link>
    </div>
    <div class="uk-width-1-2 uk-margin-auto uk-margin-medium">
      <router-link to="/profile">
        <vk-card type="primary">
          <vk-card-title>PROFILE</vk-card-title>
          <p>戦績の確認、コメント・アイコンの設定ができるぞ！</p>
        </vk-card>
      </router-link>
    </div>
  </div>
</template>

<script>
import { Card } from 'vuikit/lib/card'

export default {
  name: 'home',
  components: {
    Card
  },
  methods: {
    startGame () {

    },
    showProfile () {
    }
  }
}
</script>
