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
    <canvas ref="manualDrawRefCopy"></canvas>
  </div>
</template>
<script>
// import { fabric } from "fabric";

export default {
  name: "App",
  data() {
    return {
      manualDrawCanvasInstance: null,
      copyInstance: null,
    };
  },
  methods: {
    // 修改画板行为模式
    changeAction(mode) {
      switch (mode) {
        case "select":
          this.manualDrawCanvasInstance.isDrawingMode = false; // 不允许绘画（返回普通框选模式）
          this.copyInstance.isDrawingMode = false;
          break;
        case "erase":
          this.manualDrawCanvasInstance.isDrawingMode = true; // 进入绘画模式
          this.manualDrawCanvasInstance.freeDrawingBrush =
              new fabric.EraserBrush(this.manualDrawCanvasInstance); // 使用橡皮擦画笔
          this.manualDrawCanvasInstance.freeDrawingBrush.width = 10; // 设置画笔粗细为 10


          this.copyInstance.isDrawingMode = true;
          this.copyInstance.freeDrawingBrush =
              new fabric.EraserBrush(this.copyInstance);
          this.copyInstance.freeDrawingBrush.width = 10;
          // this.copyInstance.freeDrawingBrush.inverted = true; // 恢复被擦拭的地方


          break;
        case "undoErasing":
          this.manualDrawCanvasInstance.isDrawingMode = true;
          this.manualDrawCanvasInstance.freeDrawingBrush =
              new fabric.EraserBrush(this.manualDrawCanvasInstance);
          this.manualDrawCanvasInstance.freeDrawingBrush.width = 10;
          this.manualDrawCanvasInstance.freeDrawingBrush.inverted = true; // 恢复被擦拭的地方



          this.copyInstance.isDrawingMode = true;
          this.copyInstance.freeDrawingBrush =
              new fabric.EraserBrush(this.copyInstance);
          this.copyInstance.freeDrawingBrush.width = 10;
          this.copyInstance.freeDrawingBrush.inverted = true; // 恢复被擦拭的地方
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
            backgroundColor: "transparent",
          }
      );

      this.copyInstance = new fabric.Canvas(this.$refs.manualDrawRefCopy, {
        width: 300,
        height: 500,
        backgroundColor: "transparent",
      });

      new fabric.Image.fromURL("http://localhost:8080/logo.png", (oImg) => {
        // 创建蓝色滤镜
        var blueFilter = new fabric.Image.filters.BlendColor({
          color: "blue",
          mode: "tint",
          alpha: 0.8,
        });
        oImg.filters.push(blueFilter);
        oImg.applyFilters();
        this.manualDrawCanvasInstance.add(oImg);
      });

      new fabric.Image.fromURL("http://localhost:8080/logo.png", (oImg) => {
        // 创建蓝色滤镜
        var blueFilter = new fabric.Image.filters.BlendColor({
          color: "blue",
          mode: "tint",
          alpha: 0.8,
        });
        oImg.filters.push(blueFilter);
        oImg.applyFilters();
        this.copyInstance.add(oImg);
      });

      new fabric.Image.fromURL("http://localhost:8080/logo.png", (oImg) => {
        oImg.set("erasable", false);
        this.manualDrawCanvasInstance.setOverlayImage(oImg, () => {
          this.manualDrawCanvasInstance.renderAll();
        });
      });
      new fabric.Image.fromURL("http://localhost:8080/logo.png", (oImg) => {
        oImg.set("erasable", false);
        this.copyInstance.setOverlayImage(oImg, () => {
          this.copyInstance.renderAll();
        });
      });
      // this.manualDrawCanvasInstance.on("path:created", (e) => {
      //   var path = e.path;
      //   console.log(path.path)
      // })

      let that = this;
      let listening = false
      this.manualDrawCanvasInstance.on("mouse:down", function (e){
        if (this.isDrawingMode) {
          listening = true
        }
      })
      this.manualDrawCanvasInstance.on("mouse:move", function (e) {
        if (this.isDrawingMode && listening) {
          // 获取当前鼠标位置的路径
          var path = e.e;

          // 在第二个Canvas上创建相同的自由画布路径
          var clonedPath = new fabric.Path(
              this.freeDrawingBrush.createPath(path),
              {
                globalCompositeOperation: "destination-out",
              }
          );
          console.log(clonedPath)
          that.copyInstance.add(clonedPath);
          that.copyInstance.renderAll()
        }
      });

      this.manualDrawCanvasInstance.on("mouse:up", function (e){
        if (this.isDrawingMode) {
          listening = true
        }
      })
    },
  },
  mounted() {
    this.draw();
  },
};
</script>
