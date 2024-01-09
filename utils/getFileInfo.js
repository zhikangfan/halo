
const getFileSize = (param) => {
    return new Promise((resolve, reject) => {
        if (typeof param !== 'string' && !(param instanceof Blob)) {
            reject('Invalid parameter type. Expected string or Blob.')
        }
        let src = param
        if (param instanceof Blob) {
            src = URL.createObjectURL(param)
        }

        let image = new Image()
        image.src = src
        image.onload = function () {
            URL.revokeObjectURL(image.src)
            resolve({ width: image.width, height: image.height })
        }
        image.onerror = function (err) {
            // 释放 Blob 对象的 URL
            URL.revokeObjectURL(image.src)
            reject(err)
        }
    })
}

export default getFileSize