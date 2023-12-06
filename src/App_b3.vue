<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import fabric from 'fabric';

export default {
  mounted() {
    this.initCanvas();
  },
  methods: {
    initCanvas() {
      // 创建Canvas实例
      this.canvas = new fabric.Canvas(this.$refs.canvas);

      // 创建背景图片
      fabric.Image.fromURL('http://localhost:8080/logo.png', (img) => {
        img.set({ left: 0, top: 0, width: 400, height: 400 });
        this.canvas.add(img);

        // 创建遮罩矩形
        const maskRect = new fabric.Rect({
          left: 0,
          top: 0,
          width: 400,
          height: 400,
          fill: 'black', // 遮罩矩形的颜色，可以根据需要调整
        });

        // 创建橡皮擦路径
        const path = new fabric.Path('M 0 0 Q 0 0 0 0', {
          left: 0,
          top: 0,
          stroke: 'white',
          strokeWidth: 20, // 调整橡皮擦的大小
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          selectable: false, // 不可选中
        });

        // 将遮罩矩形设置为Canvas的遮罩
        this.canvas.setOverlayImage(maskRect, this.canvas.renderAll.bind(this.canvas));

        // 将橡皮擦路径设置为遮罩矩形的mask
        maskRect.set({ mask: path });

        // 监听鼠标移动事件，更新橡皮擦路径
        this.canvas.on('mouse:move', (options) => {
          const pointer = this.canvas.getPointer(options.e);
          const points = path.path;
          points.push(pointer.x, pointer.y);
          path.set({ path: points });
          this.canvas.renderAll();
        });
      });
    },
  },
};
</script>

<style>
canvas {
  border: 1px solid #ccc;
}
</style>
