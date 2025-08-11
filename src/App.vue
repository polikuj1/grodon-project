<script setup>
// 使用 Vue Router
</script>

<template>
  <div id="app">
    <!-- 路由視圖 -->
    <router-view />
  </div>
</template>

<style>
#app {
  width: 100%;
  height: 100%;
}

/* 全域樣式重置 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
