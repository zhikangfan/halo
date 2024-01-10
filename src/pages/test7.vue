<template>
  <div>
    <input type="file" @change="handleFileSelect">
    <button @click="save">下载</button>
    <canvas ref="canvas"></canvas>
  </div>
</template>
<script>

import getFileSize from "../../utils/getFileInfo";
import {createImg} from "@/pages/core";
import JSZip from "jszip";
import {saveAs} from 'file-saver'

export default {
  name: 'Test7',
  components: {},
  data() {
    return {
      sourceInfo: {
        src: '',
        width: 0,
        height: 0
      },
      options: {
        width: 400,
        height: 400,
        scale: 80,
        bgColor: '',
        bgImg: 'http://localhost:8080/test3.jpg',
      }
    }
  },
  methods: {
    // calculateMaxScale(origin, target) {
    //   const originWidth = origin.width
    //   const originHeight = origin.height
    //   const targetWidth = target.width
    //   const targetHeight = target.height
    //
    //   if (originWidth / originHeight > targetWidth / targetHeight) {
    //     return originWidth / targetWidth
    //   }
    //   return originHeight / targetHeight
    // },
    // calculateScale(origin, target) {
    //   const originWidth = origin.width
    //   const originHeight = origin.height
    //   const targetWidth = target.width
    //   const targetHeight = target.height
    //   // 如果target的width和height都没有超过origin的width和height，则直接返回1
    //   if (targetWidth <= originWidth && targetHeight <= originHeight) {
    //     return 1
    //   }
    //   // 按照宽度
    //   if (originWidth / originHeight < targetWidth / targetHeight) {
    //     return originWidth / targetWidth
    //   } // 按照宽度缩放
    //   return originHeight / targetHeight
    // },
    //
    // async getImg(src) {
    //   return new Promise((resolve, reject) => {
    //         let img = new Image()
    //         img.src = src
    //         img.onload = () => {
    //           resolve(img)
    //         }
    //         img.onerror = () => {
    //           reject()
    //         }
    //   })
    // },
    //
    // async createImg(source, options) {
    //   // let canvas = document.createElement('canvas')
    //   let canvas = this.$refs.canvas
    //   let ctx = canvas.getContext('2d')
    //   canvas.width = options.width
    //   canvas.height = options.height
    //
    //   // 设置背景图片
    //   if (options.bgImg) {
    //
    //     let img = await this.getImg(options.bgImg)
    //     let scale = this.calculateMaxScale({width: canvas.width, height: canvas.height}, {width: img.width, height: img.height})
    //     let finalWidth = img.width * scale
    //     let finalHeight = img.height * scale
    //     let dx =(canvas.width - finalWidth) / 2
    //     let dy = (canvas.height - finalHeight)  / 2
    //     ctx.drawImage(img, dx, dy, finalWidth, finalHeight)
    //
    //   }
    //   // 设置背景色
    //   if (options.bgColor) {
    //     ctx.fillStyle = options.bgColor;
    //     ctx.fillRect(0, 0, canvas.width, canvas.height);
    //   }
    //
    //   if (source) {
    //     let img = await this.getImg(source)
    //     let scale = this.calculateScale({width: canvas.width, height: canvas.height}, {width: img.width, height: img.height})
    //     let finalWidth = img.width * scale
    //     let finalHeight = img.height * scale
    //     let dx = (canvas.width - finalWidth) / 2
    //     let dy = (canvas.height - finalHeight)  / 2
    //     ctx.drawImage(img, dx, dy, finalWidth, finalHeight)
    //   }
    //
    //
    //
    // },
    async handleFileSelect(event) {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        let {width, height} = await getFileSize(selectedFile)
        // this.createImg(URL.createObjectURL(selectedFile), this.options)
      }
    },
    // download(type='jpg') {
    //   let canvas = this.$refs.canvas
    //   let src = canvas.toDataURL(type === 'png' ? 'image/png' : 'image/jpg', 1 )
    //   let a = document.createElement('a')
    //   a.href = src
    //   a.download = `download.${type}`
    //   a.click()
    // }

    async save() {
      let zip = new JSZip()
      let blob = await createImg('https://images.pexels.com/photos/2174974/pexels-photo-2174974.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500', {
        width: 500,
        height: 500,
        ratio: 1,
        bgImg: '',
        bgColor: 'rgba(255,0,0,1)'
      })
      zip.file(`test.png`, blob, {binary:true})
      zip.generateAsync({type: 'blob'}).then(content => {
        saveAs(content, 'test.zip')
      })
    }
  },
  async mounted() {


  }

}
</script>