// import control, { rotateIcon } from '@/core/control'
import { throttle } from 'lodash-es'
import { v4 as uuid } from 'uuid';
import emitter from "@/pages/editor/emitter";
import downFile from "@/pages/editor/download";



export class Editor {
    constructor(canvasElement, workspaceEl, options) {
        this.options = options
        this.canvasElement = canvasElement
        this.workspaceEl = workspaceEl
        this.canvas = this.createEditor(canvasElement, workspaceEl?.offsetWidth, workspaceEl?.offsetHeight)
        // control()
        this.init({
            width: options.width,
            height: options.height,
            src: options.source
        })
    }

    init({ width, height, src }) {
        this.createWorkspace(width, height)
        this.createBackground(width, height)
        this.createImg(src)
        // this.createBg()
        this.auto()
        this._initResizeObserve()
        this.bindEvent()
    }

    /**
     * @description 创建画布
     */
    createEditor(canvasElement) {
        return new fabric.Canvas(canvasElement, {
            stopContextMenu: true,
            preserveObjectStacking: true,
            controlsAboveOverlay: true,
            centeredScaling: true,
            selection: false,
            backgroundColor: 'pink'
        })
    }

    createWorkspace(width, height) {
        this.workspace = new fabric.Rect({
            id: 'workspace',
            width: width,
            height: height,
            fill: 'transparent',
            selectable: false
        })
        this.canvas.add(this.workspace)
        this.canvas.clipPath = this.workspace
        this.canvas.requestRenderAll()
    }

    createBg() {
        // 加载背景图片
        fabric.Image.fromURL('http://localhost:8080/bg.svg', (img) => {
            // 创建一个 Rect 对象，填充为背景图片
            this.bg = new fabric.Rect({
                left: 0,
                top: 0,
                fill: new fabric.Pattern({
                    source: img.getElement(),
                    repeat: 'repeat'
                })
            });

            // 添加 Rect 对象到 Canvas
            this.canvas.add(this.bg);
        });

    }
    // 创建背景
    createBackground(width, height) {
        this.background = new fabric.Rect({
            id: 'background',
            width: width,
            height: height,
            fill: 'green'
        })
        this.canvas.add(this.background)
        this.canvas.renderAll()
    }

    createImg(src) {
        new fabric.Image.fromURL(src, oImg => {
            oImg.set({
                id: 'targetImg'
            })
            this.canvas.add(oImg)
            this.canvas.renderAll()
        })
    }

    _getScale() {
        const viewPortWidth = this.workspaceEl.offsetWidth
        const viewPortHeight = this.workspaceEl.offsetHeight
        // 按照宽度
        if (viewPortWidth / viewPortHeight < this.options.width / this.options.height) {
            return viewPortWidth / this.options.width
        } // 按照宽度缩放
        return viewPortHeight / this.options.height
    }

    /**
     * 设置画布中心到指定对象中心点上
     * @param {Object} obj 指定的对象
     */
    setCenterFromObject(obj) {
        const { canvas } = this
        const objCenter = obj.getCenterPoint()
        const viewportTransform = canvas.viewportTransform
        if (canvas.width === undefined || canvas.height === undefined || !viewportTransform) return
        viewportTransform[4] = canvas.width / 2 - objCenter.x * viewportTransform[0]
        viewportTransform[5] = canvas.height / 2 - objCenter.y * viewportTransform[3]
        canvas.setViewportTransform(viewportTransform)
        canvas.renderAll()
    }

    // 初始化监听器
    _initResizeObserve() {
        const resizeObserver = new ResizeObserver(
            throttle(() => {
                this.auto()
            }, 50)
        )
        resizeObserver.observe(this.workspaceEl)
    }

    // 单个对象复制
    _copyObject(activeObject) {
        // 间距设置
        const grid = 10;
        const canvas = this.canvas;
        activeObject?.clone((cloned) => {
            if (cloned.left === undefined || cloned.top === undefined) return;
            canvas.discardActiveObject();
            // 设置位置信息
            cloned.set({
                left: cloned.left + grid,
                top: cloned.top + grid,
                evented: true,
                id: uuid(),
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
        });
    }

    // 复制元素
    clone() {
        let copyObject = this.canvas.getObjects().find(item => item.id === "targetImg")
        if (!copyObject) return;
        this._copyObject(copyObject);
    }

    // 快捷键扩展回调
    // hotkeyEvent(eventName, e) {
    //     if (eventName === 'ctrl+c' && e.type === 'keydown') {
    //         const activeObject = this.canvas.getObjects().find(item => item.id === "targetImg")
    //         this.cache = activeObject;
    //     }
    //     if (eventName === 'ctrl+v' && e.type === 'keydown') {
    //         if (this.cache) {
    //             this.clone(this.cache);
    //         }
    //     }
    // }


    setZoomAuto(scale) {
        const { workspaceEl } = this
        const width = workspaceEl.offsetWidth
        const height = workspaceEl.offsetHeight
        this.canvas.setWidth(width)
        this.canvas.setHeight(height)
        console.log(this.bg)
        // this.bg.setWidth(width)
        // this.bg.setHeight(height)
        const center = this.canvas.getCenter()
        this.canvas.setViewportTransform(fabric.iMatrix.concat())
        emitter.emit('zoom', scale)
        this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), scale)
        if (!this.workspace) return
        this.setCenterFromObject(this.workspace)

        // 超出画布不展示
        this.workspace.clone(cloned => {
            this.canvas.clipPath = cloned
            this.canvas.requestRenderAll()
        })
    }

    auto() {
        const scale = this._getScale()
        this.setZoomAuto(scale - 0.08)
    }

    setSize(width, height) {
        this.options.width = width
        this.options.height = height
        // 重新设置workspace
        this.workspace = this.canvas.getObjects().find(item => item.id === 'workspace')
        this.workspace.set('width', width)
        this.workspace.set('height', height)
        this.auto()
    }

    /**
     * @description 设置背景颜色
     * @param color
     */
    setBackground(color) {
        this.background.set({ fill: color })
    }

    bindEvent() {
        this._bindWheel()

        this.canvas.on('mouse:over', opt => {

        })

        this.canvas.on('mouse:out', opt => {
            console.log('12312')
            // opt.target?.set({
            //   stroke: null,
            //   strokeWidth: 0,
            //   strokeUniform: true
            // })
            // this.canvas.renderAll()
        })

        this.canvas.on('selection:updated', opt => {
            console.log(123131)
            emitter.emit('selected', opt)
            // opt.target?.set({
            //   stroke: null,
            //   strokeWidth: 0,
            //   strokeUniform: true
            // })
            // this.canvas.renderAll()
        })

        /**
         * @description 旋转时，实时更新旋转控制图标
         */
        this.canvas.on('object:rotating', event => {
            const body = this.canvas.lowerCanvasEl.nextSibling
            const angle = this.canvas.getActiveObject()?.angle?.toFixed(2)
            if (angle === undefined) return
            switch (event.transform?.corner) {
                case 'mtr':
                    body.style.cursor = rotateIcon(Number(angle) + 45)
                    break
                default:
                    break
            } // 设置四角旋转光标
        })
    }

    /**
     * @descriptioin 监听画布缩放
     */
    _bindWheel() {
        this.canvas.on('mouse:wheel', function (opt) {
            const delta = opt.e.deltaY
            let zoom = this.getZoom()
            zoom *= 0.999 ** delta
            if (zoom > 20) zoom = 20
            if (zoom < 0.01) zoom = 0.01
            this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
            opt.e.preventDefault()
            opt.e.stopPropagation()
        })
    }

    /**
     * 放大
     */
    big() {
        let zoomRatio = this.canvas.getZoom()
        zoomRatio += 0.05
        const center = this.canvas.getCenter()
        emitter.emit('zoom', zoomRatio)
        this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio)
    }

    /**
     * 缩小
     */
    small() {
        let zoomRatio = this.canvas.getZoom()
        zoomRatio -= 0.05
        const center = this.canvas.getCenter()
        zoomRatio = zoomRatio < 0 ? 0.01 : zoomRatio
        emitter.emit('zoom', zoomRatio)
        this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio)
    }
    _getSaveOption() {
        const workspace = this.canvas
            .getObjects()
            .find((item) => item.id === 'workspace');
        const { left, top, width, height } = workspace;
        const option = {
            name: 'New Image',
            format: 'png',
            quality: 1,
            width,
            height,
            left,
            top,
        };
        return option;
    }

    saveImg() {
        const option = this._getSaveOption();
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        const dataUrl = this.canvas.toDataURL(option);
        downFile(dataUrl, 'png');
    }

    /**
     * @description 翻转
     * @param type X | Y
     */
    flip(type) {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            activeObject.set(`flip${type}`, !activeObject[`flip${type}`]).setCoords();
            this.canvas.requestRenderAll();
        }
    }
}
