<template>
  <div>
    <div class="uk-width-1-2 uk-margin-auto uk-margin-medium">
      <router-link to="/rooms/new">
        <vk-card type="secoundry">
          <vk-card-title>部屋を作成</vk-card-title>
          <p>対戦相手を待つ部屋を作ろう！</p>
        </vk-card>
      </router-link>
    </div>
    <div class="uk-width-1-2 uk-margin-auto uk-margin-medium">
      <ul class="uk-list uk-list-large uk-list-striped">
        <li v-for="room in rooms" :key="">
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ready',
  data () {
    return {
      rooms: []
    }
  },
  methods: {
    
  }
}
</script>