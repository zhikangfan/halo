<template>
  <div>
    <canvas ref="manualDrawRef"></canvas>
  </div>
</template>
<script>
import { fabric } from "fabric";

export default {
  name: "App",
  data() {
    return {
      manualDrawCanvasInstance: null
    };
  },
  methods: {
    draw() {
      this.manualDrawCanvasInstance = new fabric.Canvas(this.$refs.manualDrawRef, {
        width: 300,
        height: 500,
        backgroundColor: 'blue'
      });
      // const ClipPath = new fabric.Rect({
      //   left: 0,
      //   top: 0,
      //   width: 150,
      //   height: 250,
      //   fill: 'pink'
      // })
      const ClipPath = new fabric.Circle({
        radius: 40,
        top: -40,
        left: -40
      });
      const rect = new fabric.Rect({
        width: 100,
        height: 100,
        fill: 'yellow'
      })
      this.manualDrawCanvasInstance.clipPath = ClipPath
      this.manualDrawCanvasInstance.add(rect)

      this.manualDrawCanvasInstance.on('mouse:down', function (opt) {
        const evt = opt.e;
        if (evt.altKey === true) {
          this.isDragging = true;
          this.selection = false;
          this.lastPosX = evt.clientX;
          this.lastPosY = evt.clientY;
        }
      })
      this.manualDrawCanvasInstance.on('mouse:move', function(opt) {
        if (this.isDragging) {
          var e = opt.e;
          var vpt = this.viewportTransform;
          vpt[4] += e.clientX - this.lastPosX;
          vpt[5] += e.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.clientX;
          this.lastPosY = e.clientY;
        }
      });
      this.manualDrawCanvasInstance.on('mouse:up', function(opt) {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
      });

      this.manualDrawCanvasInstance.on('mouse:wheel', function(opt) {
        var delta = opt.e.deltaY;
        var zoom = this.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

    },
  },
  mounted() {
    this.draw();
  },
};
</script>
