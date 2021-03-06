import { waitFor } from "@dfuse/client";
import { call } from "when/node";
const { createDfuseClient, InboundMessageType } = require("@dfuse/client")
// const client = createDfuseClient({ apiKey: "web_3c608e5fadb8fa5054a328030d8f5225", network: "mainnet" })
const client = createDfuseClient({ apiKey: "web_3c608e5fadb8fa5054a328030d8f5225", network: "jungle" })

const utils = require("./utils").default

let userStreams = []

async function getActions(username) {
  const opts = { limit: 10, sort: "desc" }
  const resp = await client.searchTransactions(`auth:` + username, opts)

  console.log(`Your last 10 transactions`)
  console.log(resp)
  // (resp.transactions || []).map((result) => `https://eosq.app/tx/${result.lifecycle.id}`)

  client.streamActionTraces({ accounts: "eosio.token", action_names: "transfer", receivers: username }, (message) => {
      if (message.type === InboundMessageType.ACTION_TRACE) {
        const { from, to, quantity, memo } = message.data.trace.act.data
        console.log(`Transfer [${from} -> ${to}, ${quantity}] (${memo})`)
      }
    }).catch((error) => {
      console.log("An error occurred.", error)
    })
}

async function getIssueActions(contract, callback) {
  const opts = { limit: 10, sort: "desc" }
  const resp = await client.searchTransactions(`auth:${contract} action:issue` , opts)

  console.log(`Issue actions on a contract`)
  console.log(resp)

  if (resp.transactions && resp.transactions.length > 0) {
    let issueActions = []
    for(var i=0; i < resp.transactions.length; i++) {
      const trx = resp.transactions[i].lifecycle
      if (trx.execution_trace && trx.execution_trace.action_traces && trx.execution_trace.action_traces.length > 0) {
        const trace = trx.execution_trace.action_traces[0]
        const {to, quantity, memo} = trace.act.data
        issueActions.push({to: to, quantity: quantity, memo: memo, time: new Date(trx.execution_trace.block_time)})
      }
    }
    console.log("found ", issueActions.length, " actions")
    callback(issueActions)
  }

  // TODO : update issue actions
  // client.streamActionTraces({ accounts: contract, action_names: "issue" }, (message) => {
  //     if (message.type === InboundMessageType.ACTION_TRACE) {
  //       const { to, quantity, memo } = message.data.trace.act.data
  //       console.log(`Issue [${to}, ${quantity}] (${memo})`)
  //     }
  //   }).catch((error) => {
  //     console.log("An error occurred.", error)
  //   })
}

async function getBalance(contract, username, callback) {
  console.log("get ", contract, "balance for ", username)
  const resp = await client.stateTable(contract, username, "accounts")
  if (resp && resp.rows && resp.rows.length>0) {
    const { balance } = resp.rows[0].json
    const message = `Balance: ${balance} (#${resp.up_to_block_num})`
    const balanceValue = utils.parseAsset(balance)
    console.log("balance: ", balance, " - ", balanceValue)
    callback(balanceValue)
  } else {
    console.log("there is no balance in ", contract, " yet, set to 0")
    callback(0)
  }

  const stream = await client.streamTableRows({ code: contract, scope: username, table: "accounts"}, (message) => {
      console.log("new stream update", message)
      if (message.type == "table_delta"
        && message.data
        && message.data.dbop
        && message.data.dbop.account == contract
        && message.data.dbop.new
        && message.data.dbop.new.json
        && message.data.dbop.new.json.balance) {
          const { balance } = message.data.dbop.new.json
          const balanceValue = utils.parseAsset(balance)
          console.log("new balance: ", balance, " - ", balanceValue, "fo user: ", username)
          callback(balanceValue)
        }
    }).catch((error) => {
      console.log("An error occurred.", error)
    })

    userStreams.push(stream)
}

async function getTokenSupply(contract, tokenName, callback) {
  console.log("get ", contract, " token supply ")
  const resp = await client.stateTable(contract, tokenName, "stat")
  if (resp && resp.rows && resp.rows.length>0) {
    const { supply } = resp.rows[0].json
    const supplyValue = utils.parseAsset(supply)
    console.log("token supply: ", supply, " - ", supplyValue)
    callback(supplyValue)
  } else {
    console.log("there is no supply in ", contract, " yet, set to 0")
    callback(0)
  }

  const stream = await client.streamTableRows({ code: contract, scope: tokenName, table: "stat"}, (message) => {
      console.log("new token supply update", message)
      if (message.type == "table_delta"
        && message.data
        && message.data.dbop
        && message.data.dbop.account == contract
        && message.data.dbop.new
        && message.data.dbop.new.json
        && message.data.dbop.new.json.supply) {
          const { supply } = message.data.dbop.new.json
          const supplyValue = utils.parseAsset(supply)
          console.log("new supplyValue: ", supply, " - ", supplyValue)
          callback(supplyValue)
        }
    }).catch((error) => {
      console.log("An error occurred.", error)
    })

    userStreams.push(stream)
}

async function getDividendsActions(profitContract, username, callback) {
  const opts = { limit: 100, sort: "desc" }
  const resp = await client.searchTransactions(`auth:${profitContract} action:transfer receiver:${username}` , opts)

  console.log(`Transfer actions from ${profitContract}`, resp)

  if (resp.transactions && resp.transactions.length > 0) {
    let actions = []
    let total = 0
    for(var i=0; i < resp.transactions.length; i++) {
      const trx = resp.transactions[i].lifecycle
      if (trx.execution_trace && trx.execution_trace.action_traces && trx.execution_trace.action_traces.length > 0) {
        const trace = trx.execution_trace.action_traces[0]
        const {to, quantity, memo} = trace.act.data
        actions.push({to: to, quantity: quantity, memo: memo, time: new Date(trx.execution_trace.block_time)})
        total += utils.parseAsset(quantity)
      }
    }
    console.log("found ", actions.length, " actions ", " total: ", total)
    callback(actions, total)
  }

  // TODO : update issue actions
  // client.streamActionTraces({ accounts: contract, action_names: "issue" }, (message) => {
  //     if (message.type === InboundMessageType.ACTION_TRACE) {
  //       const { to, quantity, memo } = message.data.trace.act.data
  //       console.log(`Issue [${to}, ${quantity}] (${memo})`)
  //     }
  //   }).catch((error) => {
  //     console.log("An error occurred.", error)
  //   })
}

async function getPresaleActions(presaleContract, username, callback) {
  const opts = { limit: 100, sort: "desc" }
  const resp = await client.searchTransactions(`auth:${presaleContract} action:transfer receiver:${username}` , opts)

  console.log(`Transfer actions from ${presaleContract}`, resp)

  if (resp.transactions && resp.transactions.length > 0) {
    let actions = []
    for(var i=0; i < resp.transactions.length; i++) {
      const trx = resp.transactions[i].lifecycle
      if (trx.execution_trace && trx.execution_trace.action_traces && trx.execution_trace.action_traces.length > 0) {
        const trace = trx.execution_trace.action_traces[0]
        const {to, quantity, memo} = trace.act.data
        actions.push({to: to, quantity: quantity, memo: memo, time: new Date(trx.execution_trace.block_time)})
      }
    }
    console.log("found ", actions.length, " actions ")
    callback(actions)
  }

  // TODO : update issue actions
  // client.streamActionTraces({ accounts: contract, action_names: "issue" }, (message) => {
  //     if (message.type === InboundMessageType.ACTION_TRACE) {
  //       const { to, quantity, memo } = message.data.trace.act.data
  //       console.log(`Issue [${to}, ${quantity}] (${memo})`)
  //     }
  //   }).catch((error) => {
  //     console.log("An error occurred.", error)
  //   })
}


// Close all user streams
function clearUserStreams() {
  console.log("clear ", userStreams.length, " streams")
  for(var i =0; i < userStreams.length; i++) {
    userStreams[i].close()
  }
  userStreams = []
}

export default {
    getBalance,
    getActions,
    clearUserStreams,
    getIssueActions,
    getTokenSupply,
    getDividendsActions,
    getPresaleActions
}
