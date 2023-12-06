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
      <input type="range" min="0" max="100" @change="onBrushSize" />
    </div>

    <div class="canvasBox">
      <div ref="brush" :style="{background: 'transparent',display: 'block', position: 'fixed', pointerEvents: 'none', borderRadius: '50%', left: 0, top: 0, border: '2px solid black', width: baseWidth + 'px', height: baseWidth + 'px', zIndex: 99999}"></div>
      <canvas ref="manualDrawRef"></canvas>
    </div>
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
      scale: 1,
      baseWidth: 10,
      top: 0,
      left: 0
    };
  },
  computed: {
    brushSize() {
      return this.baseWidth / this.scale;
    },
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
            new fabric.PencilBrush(this.manualDrawCanvasInstance); // 使用画笔
            this.manualDrawCanvasInstance.globalCompositeOperation = "source-atop" // Tips: 赋值请参考： https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation#source-out
          this.manualDrawCanvasInstance.freeDrawingBrush.width =
            this.baseWidth / this.scale; // 设置画笔粗细为 10
            this.manualDrawCanvasInstance.freeDrawingBrush.color = 'rgba(0,0,255,0.8)'

          break;
        case "undoErasing":
          this.manualDrawCanvasInstance.isDrawingMode = true;
          this.manualDrawCanvasInstance.freeDrawingBrush =
            new fabric.EraserBrush(this.manualDrawCanvasInstance);
          this.manualDrawCanvasInstance.freeDrawingBrush.width = 10;
          this.manualDrawCanvasInstance.freeDrawingBrush.inverted = true; // 恢复被擦拭的地方
          break;

        default:
          break;
      }
    },
    bindEvent() {
      let that = this;
      this.manualDrawCanvasInstance.on("mouse:down", function (opt) {
        this.freeDrawingBrush.width = that.baseWidth / that.scale;
        const evt = opt.e;
        if (evt.altKey === true) {
          this.isDragging = true;
          this.selection = false;
          this.lastPosX = evt.clientX;
          this.lastPosY = evt.clientY;
        }
      });
      this.manualDrawCanvasInstance.on("mouse:move", function (opt) {
        if (this.isDragging) {
          var e = opt.e;
          var vpt = this.viewportTransform;
          vpt[4] += e.clientX - this.lastPosX;
          vpt[5] += e.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.clientX;
          this.lastPosY = e.clientY;
        }
        that.move(opt, this);
      });
      this.manualDrawCanvasInstance.on("mouse:up", function (opt) {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
      });

      this.manualDrawCanvasInstance.on("mouse:wheel", function (opt) {
        var delta = opt.e.deltaY;
        var zoom = this.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;

        that.scale = zoom;
        // 获取当前笔触大小
        var currentBrushSize = this.freeDrawingBrush.width;

        // 计算调整后的笔触大小，以抵消缩放效果
        // var adjustedBrushSize = currentBrushSize / zoom;
        //
        // // 设置笔触的大小
        // this.freeDrawingBrush.width = adjustedBrushSize;

        this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

        // 还原笔触的大小，以确保在画布缩放后笔触大小不变
        this.freeDrawingBrush.width = that.baseWidth / zoom;

        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
      //
      // this.manualDrawCanvasInstance.on('mouse:over', function (opt) {
      //   console.log('over')
      //   that.$refs.brush.style.display = "block";
      // })
      //
      // this.manualDrawCanvasInstance.on("mouse:out", function (opt) {
      //   console.log('out')
      //   that.$refs.brush.style.display = "none";
      // });



    },
    move(opt) {
      // 调整 follower 的位置
      var x = opt.e.clientX;
      var y = opt.e.clientY;

      x = x - (this.baseWidth / 2);
      y = y - (this.baseWidth / 2);

      this.$refs.brush.style.left = x + 'px';
      this.$refs.brush.style.top = y + 'px';
    },
    init() {
      this.manualDrawCanvasInstance = new fabric.Canvas(
        this.$refs.manualDrawRef,
        {
          width: 300,
          height: 500,
          selection: false,
          freeDrawingCursor: "none", // 绘画模式 禁用鼠标样式
          backgroundColor: "transparent",
        }
      );

      new fabric.Image.fromURL("http://localhost:8080/logo.png", (oImg) => {
        this.manualDrawCanvasInstance.add(oImg);
      });

      new fabric.Image.fromURL("http://localhost:8080/logo.png", (oImg) => {
        oImg.set("erasable", false);
        this.manualDrawCanvasInstance.setOverlayImage(oImg, () => {
          //创建蓝色滤镜
          var blueFilter = new fabric.Image.filters.BlendColor({
            color: "blue",
            mode: "tint",
            alpha: 0.8,
          });
          oImg.filters.push(blueFilter);
          oImg.applyFilters();

          this.manualDrawCanvasInstance.renderAll();
        });
      });

      this.bindEvent();
    },
    onBrushSize(e) {
      this.baseWidth = e.target.value;
      this.manualDrawCanvasInstance.freeDrawingBrush.width =
        this.baseWidth / this.scale;
    },
  },
  mounted() {
    this.init();
  },
};
</script>
