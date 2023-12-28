// import control, { rotateIcon } from '@/core/control'
import {throttle} from 'lodash-es'
import {v4 as uuid} from 'uuid';
import mitt from 'mitt'
import downFile from "@/pages/editor/download";

export const EditorEvent = {
    CHANGE_ZOOM: 'change:zoom',
    RESIZE: 'resize',
    HISTORY_CHANGED: 'history:changed'

}

export class Editor {

    constructor(canvasElement, workspaceEl, options) {
        this.options = options
        this.canvasElement = canvasElement
        this.workspaceEl = workspaceEl
        this.canvas = this.createEditor(canvasElement, workspaceEl?.offsetWidth, workspaceEl?.offsetHeight)
        this.emitter = mitt()
        this.state = {
            saveLen: 0, // 保存每一步的数据 saveOperateList 的长度
            deleLen: 0, // 需要删除每一步的数据 deleteOperateList 的长度
            operIndex: -1 // 操作的 Index 的值
        }
        this.saveOperateList = [] // 保存的数据，存的值为每一步的 json 数据
        this.deleteOperateList = [] // 需要删除每一步的数据列表，存的值为 saveOperateList 的每一步的 index 的值

        // control()
        this.init({
            width: options.width,
            height: options.height,
            src: options.source
        })
    }

    init({width, height, src}) {
        this.createWorkspace(width, height)
        this.createBackground(width, height)
        this.createImg(src)
        // this.createBg()
        this.auto()
        this._initResizeObserve()
        this.bindEvent()
        this._history()

        this.test1()

    }
    extractWhitePath(img) {
        var pathData = '';

        // Convert image to data URL
        var imageDataURL = 'http://localhost:8080/test2.jpg';
        var image = new Image();
        image.src = imageDataURL;
        let that = this;

        image.onload = () => {
            // Draw the image on an off-screen canvas
            var offScreenCanvas = document.createElement('canvas');
            offScreenCanvas.width = image.width;
            offScreenCanvas.height = image.height;
            var ctx = offScreenCanvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            // Get image data from the off-screen canvas
            var imageData = ctx.getImageData(0, 0, image.width, image.height);

            // Process the image data and generate pathData
            for (var i = 0; i < imageData.data.length; i += 4) {
                var red = imageData.data[i];
                var green = imageData.data[i + 1];
                var blue = imageData.data[i + 2];

                if (red === 255 && green === 255 && blue === 255) {
                    var x = (i / 4) % image.width;
                    var y = Math.floor((i / 4) / image.width);
                    pathData += 'M' + x + ' ' + y + ' ';
                }
            }

            // Create SVG path element
            var path = new fabric.Path(pathData, {
                fill: '',
                stroke: 'purple',
                strokeWidth: 2
            });
            console.log(path.path)
            this.canvas.isDrawingMode = true;
            this.canvas.freeDrawingBrush.color = 'purple';
            this.canvas.freeDrawingBrush.width = 2;

            this.canvas.freeDrawingBrush.path = path;
            // Add the path to the canvas
            this.canvas.add(path);
            this.canvas.renderAll();
        };
    }
    test1() {

        // 加载图片到Canvas
        // fabric.Image.fromURL('http://localhost:8080/test2.jpg', function(img) {
        //     // 设置图片对象属性
        //     img.set({
        //         left: 0,
        //         top: 0
        //     });
        //
        //     // 将图片添加到Canvas
        //     // this.canvas.add(img);
        //
        //     // 提取白色区域成路径
        //     extractWhitePath(img);
        // });

        this.extractWhitePath()
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
            this._save() // 图片加载好后保存一次
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
        const {canvas} = this
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
        const {workspaceEl} = this
        const width = workspaceEl.offsetWidth
        const height = workspaceEl.offsetHeight
        this.canvas.setWidth(width)
        this.canvas.setHeight(height)
        // this.bg.setWidth(width)
        // this.bg.setHeight(height)
        const center = this.canvas.getCenter()
        this.canvas.setViewportTransform(fabric.iMatrix.concat())
        this._emit(EditorEvent.CHANGE_ZOOM, scale)
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

    _emit(type, ...args) {
        const condition = Object.keys(EditorEvent).includes(type) || Object.values(EditorEvent).includes(type)
        if (condition) {
            this.emitter.emit(type, args)
        }

    }

    on(type, handler) {
        const condition = (Object.keys(EditorEvent).includes(type) || Object.values(EditorEvent).includes(type)) && typeof handler === 'function'
        if (condition) {
            this.emitter.on(type, handler)
        }
    }

    off(type, handler) {
        const condition = (Object.keys(EditorEvent).includes(type) || Object.values(EditorEvent).includes(type)) && typeof handler === 'function'
        if (condition) {
            this.emitter.off(type, handler)
        }
    }

    clearAllEditorEvent() {
        this.emitter.all.clear()
    }

    /**
     * @description 设置背景颜色
     * @param color
     */
    setBackground(color) {
        this.background.set({fill: color})
    }

    bindEvent() {
        this._bindWheel()

        this.canvas.on('mouse:over', opt => {

        })

        this.canvas.on('mouse:out', opt => {
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
            this.zoomToPoint({x: opt.e.offsetX, y: opt.e.offsetY}, zoom)
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
        this._emit(EditorEvent.CHANGE_ZOOM, zoomRatio)
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
        this._emit(EditorEvent.CHANGE_ZOOM, zoomRatio)
        this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio)
    }

    _getSaveOption() {
        const workspace = this.canvas
            .getObjects()
            .find((item) => item.id === 'workspace');
        const {left, top, width, height} = workspace;
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

    _save() {
        const json = this.canvas.toJSON()
        if (this.state.deleLen > 0) {
            this.deleteOperateList.some(item => {
                this.saveOperateList[item].del = true
            })
            this.saveOperateList = this.saveOperateList.filter(item => {
                return !item.del
            })
            this.deleteOperateList = []
            this.saveOperateList.push(json)
            this.state.operIndex = this.saveOperateList.length - 1
        } else {
            this.saveOperateList.push(json)
            this.state.operIndex += 1
        }
        this.state.saveLen = this.saveOperateList.length
        this.state.deleLen = this.deleteOperateList.length

        this._historyChangeEvent()
    }

    _history() {
        this.canvas.on({
            // 'object:added': () => this._save(),
            'object:modified': () => this._save(),
            // 'selection:updated': () => this._save(),
        });
    }

    _historyChangeEvent() {
        this._emit(EditorEvent.HISTORY_CHANGED, {
            hasUndo: this.state.operIndex > 0,
            hasRedo: this.state.operIndex + 1 >= this.saveOperateList.length
        })
    }

    // 上一步
    undo() {
        if (this.state.operIndex > 0) {
            this.canvas.loadFromJSON(this.saveOperateList[this.state.operIndex - 1]).renderAll()
            if (this.deleteOperateList.includes(this.state.operIndex - 1)) {

            } else {
                this.deleteOperateList.push(this.state.operIndex)
                this.state.operIndex -= 1
            }
        }
        this.state.saveLen = this.saveOperateList.length
        this.state.deleLen = this.deleteOperateList.length
    }
    // 下一步
    redo() {
        if (this.state.operIndex + 1 >= this.saveOperateList.length) {
            return
        }
        this.canvas.loadFromJSON(this.saveOperateList[this.state.operIndex + 1]).renderAll()
        if (this.deleteOperateList.includes(this.state.operIndex + 1)) {
            const index = this.deleteOperateList.indexOf(this.state.operIndex + 1)
            this.deleteOperateList.splice(index, 1)
        } else {

        }
        this.state.operIndex = this.state.operIndex + 1
        this.state.saveLen = this.saveOperateList.length
        this.state.deleLen = this.deleteOperateList.length
    }
    // 重做
    redoAll() {
        this.deleteOperateList = []
        this.saveOperateList = [this.saveOperateList.shift()]
        this.state.operIndex = 0
        this.state.saveLen = this.saveOperateList.length
        this.state.deleLen = this.deleteOperateList.length
        this.canvas.loadFromJSON(this.saveOperateList[this.state.operIndex]).renderAll()

    }

    brush1() {
        let img = new Image();
        img.src = this.options.source

        // var texturePatternBrush = new fabric.PatternBrush(this.canvas);
        // texturePatternBrush.source = img;

        img.onload = () => {
            // this.canvas.contextTop.globalCompositeOperation = 'destination-in'
            let texturePatternBrush = new fabric.PatternBrush(this.canvas);

            // texturePatternBrush.clipTo = (ctx) => {
            //     if (this.canvas.clipPath) {
            //         this.canvas.clipPath.render(ctx);
            //     }
            // };

            texturePatternBrush.source = img;
            texturePatternBrush.width = 50
            texturePatternBrush.limitedToCanvasSize = true

            this.canvas.isDrawingMode = true
            this.canvas.freeDrawingBrush = texturePatternBrush
            // this.canvas.freeDrawingBrush.limitedToCanvasSize = true


        }
    }

    brush() {
        // const base64 = this.canvas.toDataURL()
        // console.log(base64)
        //
        // let img = new Image();
        // // img.src = base64;
        // img.src = this.options.source
        // this.canvas.isDrawingMode = true
        // img.onload = () => {
        //     let texturePatternBrush = new fabric.PatternBrush(this.canvas);
        //     texturePatternBrush.source = img;
        //     texturePatternBrush.width = 50;
        //
        //     this.canvas.freeDrawingBrush.globalCompositeOperation = "destination-out"
        //     // this.canvas.globalCompositeOperation = 'source-out'
        //     this.canvas.freeDrawingBrush = texturePatternBrush;
        //     // this.canvas.freeDrawingBrush.limitedToCanvasSize = true;
        //
        //
        // };

        this.canvas.isDrawingMode = true
        this.canvas.freeDrawingBrush = new fabric.EraserBrush(this.canvas)
        this.canvas.freeDrawingBrush.invoke = false
        let initPath = this.canvas.freeDrawingBrush.createPath('M,58.99,53.99,Q,59,54,59.5,55,Q,60,56,62,58,Q,64,60,66.5,63,Q,69,66,72,68,Q,75,70,85.5,76.5,Q,96,83,107.5,88,Q,119,93,126.5,94.5,Q,134,96,145.5,97,L,157.01,98.01')
        // initPath.set({
        //     stroke: 'black'
        // })
        this.canvas.add(initPath)
        this.canvas.renderAll()
    }








}
