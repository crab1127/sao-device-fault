<template>
  <div id="app">
    <template v-if="bootstrap">  
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </template>  
  </div>
</template>

<script>
import authorize from './authorize'

export default {
  name: 'app',
  data () {
    return {
      bootstrap: false
    }
  },
  mounted () {
    console.log('234352352525452')
    this.setSize()
    this.authorize()
  },
  methods: {
    authorize() {
      // try {
        // const authorize = JSON.parse(ticket)
        sessionStorage.authorize = ticket
        this.bootstrap = true
      // } 
      // authorize()
      //   .then(res => {
      //     this.bootstrap = true
      //   })
    },
    setSize() {
      this.routeName = this.$route.name
      let deviveWidth = document.documentElement.clientWidth
      document.documentElement.style.fontSize = `${deviveWidth / 7.5}px`
    }
  }
  
}
</script>

<style>
@import url('./assets/index.css');
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
