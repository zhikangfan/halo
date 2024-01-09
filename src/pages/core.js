
class CanvasImg {
    constructor(source, options) {
        this.source = source
        this.options = options
        this.canvas = document.createElement('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.init()
    }
    async init() {
        this.canvas.width = this.options.width
        this.canvas.height = this.options.height
        // 设置背景图片
        if (this.options.bgImg) {

            let img = await this._getImg(this.options.bgImg)
            let scale = this._calculateMaxScale({width: this.canvas.width, height: this.canvas.height}, {width: img.width, height: img.height})
            let finalWidth = img.width * scale
            let finalHeight = img.height * scale
            let dx =(this.canvas.width - finalWidth) / 2
            let dy = (this.canvas.height - finalHeight)  / 2
            this.ctx.drawImage(img, dx, dy, finalWidth, finalHeight)

        }
        // 设置背景色
        if (this.options.bgColor) {
            this.ctx.fillStyle = this.options.bgColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 画主图
        if (this.source) {
            let img = await this._getImg(this.source)
            let scale = this._calculateScale({width: this.canvas.width, height: this.canvas.height}, {width: img.width, height: img.height})
            let finalWidth = img.width * scale
            let finalHeight = img.height * scale
            let dx = (this.canvas.width - finalWidth) / 2
            let dy = (this.canvas.height - finalHeight)  / 2
            this.ctx.drawImage(img, dx, dy, finalWidth, finalHeight)
        }
    }
    async _getImg(src) {
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.src = src
            img.onload = () => {
                resolve(img)
            }
            img.onerror = () => {
                reject()
            }
        })
    }
    _calculateMaxScale(origin, target) {
        const originWidth = origin.width
        const originHeight = origin.height
        const targetWidth = target.width
        const targetHeight = target.height

        if (originWidth / originHeight > targetWidth / targetHeight) {
            return originWidth / targetWidth
        }
        return originHeight / targetHeight
    }
    _calculateScale(origin, target) {
        const originWidth = origin.width
        const originHeight = origin.height
        const targetWidth = target.width
        const targetHeight = target.height
        // 如果target的width和height都没有超过origin的width和height，则直接返回1
        if (targetWidth <= originWidth && targetHeight <= originHeight) {
            return 1
        }
        // 按照宽度
        if (originWidth / originHeight < targetWidth / targetHeight) {
            return originWidth / targetWidth
        } // 按照宽度缩放
        return originHeight / targetHeight
    }

    exportData(type) {
        return this.canvas.toDataURL(type, 1)
    }
}