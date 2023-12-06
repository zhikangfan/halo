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
      <button>导出</button>
      <button @click="handleClone">复制</button>
    </div>
    <div ref="workspace" class="workspace">
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>

<script>
import { Editor } from "./core";
import emitter from "@/pages/editor/emitter";

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
  },
  mounted() {
    this.editor = new Editor(this.$refs.canvas, this.$refs.workspace, {
      source: "http://localhost:8080/test1a.jpg",
      width: 500,
      height: 500,
    });

    emitter.on("selected", (opt) => {
      console.log(opt, "---监听到了");
    });
  },
  beforeDestroy() {
    // clearing all events
    emitter.all.clear()
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