import Vue from 'vue'
import Router from 'vue-router'
import Register from './views/Register.vue'
import Login from './views/Login'
import Home from './views/Home'
import rooms from './views/rooms'
import Waiting from './views/room/Waiting'
import Profile from './views/Profile'
import Matching from './views/room/Janken'
import Result from './views/room/Result'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: { name: 'login' }
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/rooms',
      name: 'rooms',
      component: rooms
    },
    {
      path: '/rooms/:roomId/waiting',
      name: 'waiting',
      component: Waiting
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/rooms/:roomId/matching',
      name: 'matching',
      component: Matching
    },
    {
      path: '/rooms/:roomId/result',
      name: 'result',
      component: Result
    }
  ]
})
// localhost:8080/rooms/:id/play
// localhost:8080/rooms/:id/wait
