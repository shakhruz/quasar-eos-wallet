import ScatterJS from 'scatterjs-core'
import ScatterEOS from 'scatterjs-plugin-eosjs2'
import {JsonRpc, Api} from 'eosjs'

ScatterJS.plugins( new ScatterEOS() )

// const network = ScatterJS.Network.fromJson({
//     blockchain:'eos',
//     chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
//     host:'nodes.get-scatter.com',
//     port:443,
//     protocol:'https',
//     eosContract: "eosio.token",
//     tokenContract: "blockcentrex",
//     profitsContract: "omsudprofits",
//     eosdtContract: "eosdttokenxx"
// })

const network = ScatterJS.Network.fromJson({
    blockchain:'eos',
    chainId:'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
    host:'jungle2.cryptolions.io',
    port:443,
    protocol:'https',
    eosContract: "eosio.token",
    tokenContract: "omusdledger1",
    profitsContract: "omsudprofits",
    eosdtContract: "eosdttoken11",
    presaleContract: "omusdpresale"
})


const rpc = new JsonRpc(network.fullhost())

function transfer(eos, account, to, qty, memo) {
    if (eos) {
        console.log("eos: ", eos)
        eos.transact({
            actions: [{
                account: 'eosio.token',
                name: 'transfer',
                authorization: [{
                    actor: account.name,
                    permission: account.authority,
                }],
                data: {
                    from: account.name,
                    to: to,
                    quantity: qty,
                    memo: memo,
                },
            }]
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
        }).then(res => {
            console.log('sent: ', res);
        }).catch(err => {
            console.error('error: ', err);
        });
    } else {
        console.error("eos is not defined")
    }
}

function issueTokens(eos, contract, account, to, qty, memo) {
    if (eos) {
        eos.transact({
            actions: [{
                account: contract,
                name: 'issue',
                authorization: [{
                    actor: account.name,
                    permission: account.authority,
                }],
                data: {
                    to: to,
                    quantity: qty,
                    memo: memo,
                },
            }]
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
        }).then(res => {
            console.log('issued: ', res);
        }).catch(err => {
            console.error('error: ', err);
        });
    } else {
        console.error("eos is not defined")
    }
}

export default {
    ScatterJS,
    network,
    rpc,
    Api,
    transfer,
    issueTokens
}
