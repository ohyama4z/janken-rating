<template>
  <div>
    <div>PROFILE</div>
    <div>img</div>
    <div>comment</div>
    <div>rating</div>
</template>

<script>

export default {
  name: 'profile',
  data () {
      
  },
  components: {
    
  },
  mounted () {
    const method = 'GET'
    const body = ''
    const headers = { 'Accept': 'application/json' }
    fetch('/api/profile', { method, headers, body }).then((res) => res.json()).then (res => {})
  },
  methods: {
    startGame () {

    },
    showProfile () {
    }
  }
}
</script>