<template>
  <div>
    <div style="margin-bottom: 10px">
      <button id="select" type="button" @click="changeAction('select')">
        select
      </button>
      <button id="erase" type="button" @click="changeAction('erase')">
        erase
      </button>
      <button id="erase" type="button" @click="changeAction('undoErasing')">
        undo erasing
      </button>
    </div>

    <canvas ref="manualDrawRef"></canvas>
  </div>
</template>
<script>
// import { fabric } from "fabric";

export default {
  name: "App",
  data() {
    return {
      manualDrawCanvasInstance: null,
    };
  },
  methods: {
    // 修改画板行为模式
    changeAction(mode) {
      switch (mode) {
        case "select":
          this.manualDrawCanvasInstance.isDrawingMode = false; // 不允许绘画（返回普通框选模式）
          break;
        case "erase":
          this.manualDrawCanvasInstance.isDrawingMode = true; // 进入绘画模式
          this.manualDrawCanvasInstance.freeDrawingBrush =
            new fabric.EraserBrush(this.manualDrawCanvasInstance); // 使用橡皮擦画笔
          this.manualDrawCanvasInstance.freeDrawingBrush.width = 10; // 设置画笔粗细为 10
          break;
        case "undoErasing":
          this.manualDrawCanvasInstance.isDrawingMode = true;
          this.manualDrawCanvasInstance.freeDrawingBrush =
            new fabric.EraserBrush(this.manualDrawCanvasInstance);
          this.manualDrawCanvasInstance.freeDrawingBrush.width = 10;
          this.manualDrawCanvasInstance.freeDrawingBrush.inverted = true; // 恢复被擦拭的地方
        default:
          break;
      }
    },
    draw() {
      this.manualDrawCanvasInstance = new fabric.Canvas(
        this.$refs.manualDrawRef,
        {
          width: 300,
          height: 500,
          backgroundColor: "blue",
        }
      );

      this.manualDrawCanvasInstance.add(
        // 第二个正方形（桃红色）
        new fabric.Rect({
          top: 50,
          left: 150,
          width: 50,
          height: 50,
          fill: "#f47983",
          opacity: 0.8,
        })
      );
    },
  },
  mounted() {
    this.draw();
  },
};
</script>
