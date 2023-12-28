<template>
  <div>
    <input type="file" id="imageInput" accept="image/png">
    <canvas id="outputCanvas" width="500" height="500" style="border:1px solid #000;"></canvas>
  </div>
</template>
<script>
export default {
  name: "editor3",
  components: {},
  props: {},
  data() {
    return {};
  },
  methods: {},
  created() {},
  mounted() {
    const imageInput = document.getElementById('imageInput');
    const outputCanvas = new fabric.Canvas('outputCanvas');

    imageInput.addEventListener('change', handleImage);

    function handleImage() {
      const file = imageInput.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
          const img = new Image();

          img.onload = function() {
            processImage(img);
          };

          img.src = e.target.result;
        };

        reader.readAsDataURL(file);
      }
    }

    function processImage(img) {
      // 创建 fabric.Image 对象
      const fabricImage = new fabric.Image(img, {
        width: outputCanvas.width,
        height: outputCanvas.height,
      });

      // 添加 fabric.Image 对象到 canvas
      outputCanvas.add(fabricImage);

      // 将底色透明的部分变为黑色，非透明的部分变为白色
      fabricImage.filters.push(new fabric.Image.filters.RemoveColor({
        color: 'rgba(255, 255, 255, 0)', // 透明的颜色
      }));

      // 应用滤镜并重新渲染
      fabricImage.applyFilters();
      outputCanvas.renderAll();
      console.log(fabricImage)
      var a  = outputCanvas.toSVG()
      console.log(a)
      // 获取路径数据
      // const pathData = fabricImage.toSVG();
      // console.log(pathData);
    }
  },
};
</script>
<style scoped lang="less"></style>
