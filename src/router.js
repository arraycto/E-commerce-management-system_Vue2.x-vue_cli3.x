import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'
import { from } from 'core-js/fn/array'
Vue.use(Router)

const route = new Router({
  routes: [
    { path: '/login' , component: Login },
    { path: '/' , redirect: '/login' },
    { path: '/home' , 
      component: Home , 
      redirect: '/welcome' ,
      children:
              [ 
                    { path: '/welcome' , component: Welcome},
                    { path: '/users' , component: Users},
                    { path: '/rights' , component: Rights},
                    { path: '/roles' , component: Roles}
              ] 
    },
  ]
})
// 挂载路由导航守卫
route.beforeEach(
  (to , from , next ) => {
    if(to.path === '/login'){
      next()
      return
    }
    const tokenStr = window.sessionStorage.getItem('token')
    if(!tokenStr){
      next('/login')
    }
    else{
      next()
    }
  }
)


export default route