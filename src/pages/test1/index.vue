<template>
  <div id="app" @contextmenu.prevent="handleContextMenu">
    <div :class="{'imageContainer': true, 'scaleHeight': fileInfo.originInfo.width >= fileInfo.originInfo.height}" style="display: none">
      <div class="figureBox" :style="{ width: position + 'px' }">
        <div class="imgBox">
          <img :draggable="false" :src="fileInfo.originInfo.src" alt="" class="nowImg">
        </div>
      </div>
      <img :draggable="false" :src="fileInfo.targetInfo.src" alt="" class="originImg"
           :style="{width: fileInfo.targetInfo.width, height: fileInfo.targetInfo.height}">
      <div class="moveBtn" :style="{ left: position + 'px' }">
        <div class="move" @mousedown="figureMouseDown"></div>
      </div>
    </div>
    <input type="file" @change="handleFileSelect">
  </div>
</template>

<script>
import {initializeImageMagick, ImageMagick} from "@imagemagick/magick-wasm";

export default {
  name: 'App',
  components: {},
  data() {
    return {
      dragging: false,
      position: `calc(50% - 20px)`,
      fileInfo: {
        originInfo: {
          width: 1021,
          height: 1021,
          src: require('@/assets/test3b.png')
        },
        targetInfo: {
          width: 1021,
          height: 1021,
          src: require('@/assets/test3.png')
        }
      },
      // fileInfo: {
      //   originInfo: {
      //     width: 583,
      //     height: 328,
      //     src: require('@/assets/test2a.webp')
      //   },
      //   targetInfo: {
      //     width: 583,
      //     height: 328,
      //     src: require('@/assets/test2b.webp')
      //   }
      // }
    }
  },
  methods: {
    handleContextMenu(event) {
      // 阻止默认右键点击行为
      event.preventDefault();
    },
    figureMouseDown(event) {
      this.dragging = true
      const clientX = event.clientX || event.touches[0].clientX

      const container = this.$el.querySelector('.imageContainer')
      const containerLeft = container.getBoundingClientRect().left
      const figureBox = this.$el.querySelector('.move')
      const figureBoxWidth = figureBox.clientWidth + 2 // 2是因为 border宽度

      const newPosition = clientX - containerLeft

      this.position = Math.max(figureBoxWidth / 2, Math.min(container.offsetWidth - figureBoxWidth / 2, newPosition))

      document.addEventListener('mousemove', this.drag)
      document.addEventListener('touchmove', this.drag, {passive: false})
      document.addEventListener('mouseup', this.stopDrag)
      document.addEventListener('touchend', this.stopDrag)
    },
    drag(event) {
      if (this.dragging) {
        const clientX = event.clientX || event.touches[0].clientX
        const container = this.$el.querySelector('.imageContainer')
        const containerLeft = container.getBoundingClientRect().left
        const figureBox = this.$el.querySelector('.move')
        const figureBoxWidth = figureBox.clientWidth + 2
        const newPosition = clientX - containerLeft
        this.position = Math.max(figureBoxWidth / 2, Math.min(container.offsetWidth - figureBoxWidth / 2, newPosition))

      }
    },
    stopDrag() {
      this.dragging = false
      document.removeEventListener('mousemove', this.drag)
      document.removeEventListener('touchmove', this.drag)
      document.removeEventListener('mouseup', this.stopDrag)
      document.removeEventListener('touchend', this.stopDrag)
    },
    handleFileSelect(event) {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = () => {
          let arrayBuffer = reader.result; // reader.result 是文件内容
          const uint8Array = new Uint8Array(arrayBuffer);
          console.log( uint8Array)
          initializeImageMagick().then(() => {
            // let a = MagickImage.create(uint8Array)
            // // console.log(a)
            // a.write(MagickFormat.Png,(data) => {
            //   console.log(data)
            // })
            function ee(e) {
              var t = {
                png: "image/png",
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                gif: "image/gif",
                bmp: "image/bmp",
                webp: "image/webp",
                tif: "image/tiff",
                tiff: "image/tiff",
                avif: "avif.avif",
                orf: "image/ORF",
                svg: "image/svg+xml"
              };
              return t[e] || "image/png"
            }

            ImageMagick.read(uint8Array, function (e) {
              e.write((data) => {
                let blob = new Blob([data], {
                  type:ee('png')
                })
                console.log(blob)
              })
            }, 'PNG')
          })
        };
        reader.readAsArrayBuffer(selectedFile); // 以文本形式读取文件内容
      }
    },
  },
  mounted() {
    document.addEventListener('keydown', function (event) {
      if (event.ctrlKey && event.shiftKey && event.key === 'i') {
        // Ctrl + Shift + I shortcut detected
        document.write('<h1>不允许</h1>')
        // You can perform your desired action here
      }
    });

  }

}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.imageContainer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 860px;
  height: 508px;
  border: 1px solid #000;
  background-color: pink;


}

.imageContainer img {
  max-width: 100%;
  object-fit: contain;
}

.imageContainer.scaleHeight img {
  max-height: 100%;
  max-width: none;
  user-select: none; /* 阻止文本选中效果 */
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-user-drag: none; /* 阻止图片拖动效果 */
}

.figureBox {
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  overflow: hidden;
  height: 100%;
  background-color: red;
}

.imgBox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 860px;
  height: 508px;
  background-color: green;
}

.moveBtn {
  position: absolute;
  left: 50%;
  top: 0;
  width: 1px;
  height: 100%;
  background-color: black;
}

.move {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) translateX(-50%);
  width: 40px;
  height: 40px;
  background-color: #ffff4f;
  cursor: e-resize;
}
</style>
