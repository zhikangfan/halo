<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
// import {buildInputFile, execute, loadImageElement} from "wasm-imagemagick";
export default {
  name: 'App',
  components: {},
  data() {
    return {
    }
  },
  methods: {

  },
  async mounted() {
//     const { outputFiles, exitCode, stderr} = await execute({
//       inputFiles: [await buildInputFile('http://localhost:8080/test2.jpg', 'image1.png')],
//       commands: `
//     convert image1.png -bordercolor #ffee44 -background #eeff55 +polaroid image2.png
//     convert image2.png -fill #997711 -tint 55 image3.jpg
// `
//     })
//     if (exitCode) {
//       alert(`There was an error with the command: ${stderr.join('\n')}`)
//     }
//     else {
//       await loadImageElement(outputFiles[1], document.querySelector('#outputImage'))
//     }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
