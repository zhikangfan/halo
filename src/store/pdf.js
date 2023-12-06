const state = () => ({
    options: {}, // 转换所需参数
    inputFiles: [], // 输入文件
    outputFiles: [], // 输出文件
    downloadHistory: [] // 下载的历史记录
})
const getters = {

}
const actions = {
    execute ({commit}, { file }) { // 点击全部执行

    },
    add({commit}, {id}) { // 添加

    },
    remove({commit}, {id}) { // 移除

    },
    clearAll({commit}) { // 清空

    },

}
const mutations  = {

}
export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
