<template>

  <div>
    <input type="text" id="input">
    <ul>
      <li>
        <router-link to="/editor">editor</router-link>
        <router-link to="/editor3">editor</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {

    }
  },
  mounted() {
    console.log('ok')
    document.querySelector('#input').focus()
    window.onbeforeunload = function (e) {
      e.preventDefault()
      e.returnValue = true;
      return '作品还未保存或下载，是否要离开？'
    }
  }
}
</script>