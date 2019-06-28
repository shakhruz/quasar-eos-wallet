const state = {
    tasks: [
        {id:1, name: 'Goto shop', completed: false, dueDate: '2019/05/12', dueTime: '18:30'},
        {id:2, name: 'Get banans', completed: false, dueDate: '2019/05/12', dueTime: '18:30'},
        {id:3, name: 'Get apples', completed: false, dueDate: '2019/05/12', dueTime: '18:30'}
      ]
}

const mutations = {
    updateTask(state, payload) {
        console.log('payload: ', payload)
        Object.assign(state.tasks[payload.id], payload.updates)
    }

}

const actions = {
    updateTask({ commit }, payload) {
        console.log('update Task')
        commit('updateTask', payload)
    }
}

const getters = {
    tasks: (state) => {
        return state.tasks
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}