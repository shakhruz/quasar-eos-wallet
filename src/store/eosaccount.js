import scatter from '../scatter' 
import dfuse from '../dfuse' 
import { Notify } from 'quasar'

const network = scatter.network
const rpc = scatter.rpc
const Api = scatter.Api

const state = {
    loggedIn: false,
    account: {},
    balance: {
      eos: 0,
      token: 0,
      share: 0,
      eosdt: 0,
      divsEosdt: 0,
      divsEos: 0,
      roiLastMonth: 0,
      roiTotal: 0,
      tokensOnSale: 0,
      currentProfits: 0
    },
    tokenSupply: 0,
    issueActions: [],
    dividendsActions: [],
    presaleActions: []
}

let eos = {}

const mutations = {
    update(state, payload) {
        Object.assign(state, payload)
    },    
    updateBalance(state, payload) {
        Object.assign(state.balance, payload)    
    }
}

const actions = {
    login({ commit }) {
        scatter.ScatterJS.connect('ProjectX', {network}).then(connected => {
            if(!connected) {
                Notify.create({
                    message: 'Не могу соединиться со Scatter. Пожалуйста убедитесь что он запущен или скачайте его с http://Get-Scatter.com',
                    color: 'negative',
                    position: 'top'
                })
                return console.error('no scatter')
            }
            const eos1 = scatter.ScatterJS.eos(network, Api, {rpc, beta3:true})
            eos = eos1
            scatter.ScatterJS.login().then(id => {
                if(!id) return console.error('no identity')
                else {
                    commit('update', {account: scatter.ScatterJS.account('eos'), loggedIn: true})
                    dfuse.getBalance(network.eosContract, state.account.name, (result) => {if (result) commit('updateBalance', {eos: result})})
                    dfuse.getBalance(network.tokenContract, state.account.name, (result) => {if (result) commit('updateBalance', {token: result})})
                    dfuse.getBalance(network.eosdtContract, state.account.name, (result) => {if (result) commit('updateBalance', {eosdt: result})})
                    dfuse.getBalance(network.tokenContract, network.presaleContract, (result) => {if (result) commit('updateBalance', {tokensOnSale: result})})
                    dfuse.getTokenSupply(network.tokenContract, network.tokenName, (result) => {if (result) commit('update', {tokenSupply: result})})
                    dfuse.getIssueActions(network.tokenContract, (result) => {
                        if (result) {
                            console.log("got issue actions: ", result)
                            commit('update', {issueActions: result})
                        }
                    })
                    dfuse.getDividendsActions(network.profitsContract, state.account.name, (actions, total) => {
                        if (actions) {
                            console.log("got dividends actions: ", actions)
                            commit('update', {dividendsActions: actions})
                            commit('updateBalance', {divsEosdt: total})
                        }
                    })
                    dfuse.getPresaleActions(network.presaleContract, state.account.name, (actions) => {
                        if (actions) {
                            console.log("got presale actions: ", actions)
                            commit('update', {presaleActions: actions})
                        }
                    })
                    dfuse.getBalance(network.eosdtContract, network.profitsContract, (result) => {if (result) commit('updateBalance', {currentProfits: result})})

                    return true
                    // this.getActions(this.account.name)
                    // dfuse.getIssueActions("blockcentrex", (issueActions) => {this.issueActions = issueActions})
                }
            })
        })
    },
    logout({ commit }) {
        scatter.ScatterJS.logout().then(result => {
            if(!result) return console.error('failed to logout')
            commit('update', {account: null, loggedIn: false})
            commit('updateBalance', {eos: 0, token: 0, eosdt: 0})
            dfuse.clearUserStreams()
            return true
        })    
    },
    transferToPresale({ commit }, qty) {
        console.log("transfer to presale: ", qty + '.0000 EOSDT')
        scatter.transfer(eos, network.eosdtContract, state.account, network.presaleContract, qty+ '.0000 EOSDT', 'purchase OMUSD on Presale')
    }
}

const getters = {
    loggedIn: (state) => {
        return state.loggedIn
    },
    account: (state) => {
        return state.account
    },
    balance: (state) => {
        return state.balance
    },
    tokenSupply: (state) => {
        return state.tokenSupply
    },
    issueActions: (state) => {
        return state.issueActions
    },
    dividendsActions: (state) => {
        return state.dividendsActions
    },
    presaleActions: (state) => {
        return state.presaleActions
    },
    eos: (state) => {
        return eos
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}