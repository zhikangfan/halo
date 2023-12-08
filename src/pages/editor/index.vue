<template>
  <div class="main">
    <div class="panel">
      <input type="file" @change="handleFileSelect" />
      宽：<input type="text" placeholder="宽度" v-model="width" /> 高：<input
        type="text"
        placeholder="高度"
        v-model="height"
      />
      <button>确定</button>
      <button @click="handleExport">导出</button>
      <button @click="handleClone">复制</button>
      <button @click="handleFlip('X')">水平翻转</button>
      <button @click="handleFlip('Y')">竖直翻转</button>
      <button @click="handlePrev">上一步</button>
      <button @click="handleNext">下一步</button>
      <button @click="handleRedo">重做</button>
      <button @click="handleBig">放大</button>
      <span id="zoomValue">0</span>
      <button @click="handleSmall">缩小</button>
      <button @click="handleMove">移动</button>
    </div>
    <div ref="workspace" class="workspace">
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>

<script>
import { Editor, EditorEvent } from "./core";

export default {
  name: "EditorPage",
  data() {
    return {
      width: 0,
      height: 0,
      editor: null,
    };
  },
  methods: {
    handleFileSelect(event) {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        console.log(selectedFile);
      }
    },
    handleClone() {
      this.editor.clone();
    },
    handleExport() {
      this.editor.saveImg()
    },
    handleFlip(type) {
      this.editor.flip(type)
    },
    handlePrev() {
      this.editor.undo()
    },
    handleNext() {
      this.editor.redo()
    },
    handleRedo() {
      this.editor.redoAll()
    },
    handleBig() {
      this.editor.big()
    },
    handleSmall() {
      this.editor.small()
    },
    handleMove() {

    }
  },
  mounted() {


    this.editor = new Editor(this.$refs.canvas, this.$refs.workspace, {
      source: "http://localhost:8080/test1a.jpg",
      width: 500,
      height: 500,
    });
    // 监听zoom变化
    this.editor.on(EditorEvent.CHANGE_ZOOM, (zoom) => {
      document.querySelector('#zoomValue').innerText = Math.floor(zoom * 100) + '%'
    })
    this.editor.on(EditorEvent.HISTORY_CHANGED, (res) => {
      console.log(res, '----')
    })
  },
  beforeDestroy() {
    // clearing all events

  },
};
</script>
<style>
.main {
  height: 100vh;
  width: 100%;
}
.workspace {
  width: 100%;
  height: 100%;
}
</style>