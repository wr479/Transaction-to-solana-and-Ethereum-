const Web3 = require('web3');


class Transactions  {
    
    
    async sendNative(_privKey, _from, _to, _amount, _chainId, )  {

        let blockchain;
        blockchains.map(element => element.chainId === _chainId ? blockchain = element : false)
        let web3 = new Web3(blockchain.rpc);
        
        let gasPrice = Number((Number(web3.utils.fromWei(await web3.eth.getGasPrice(), 'gwei')) + 2).toFixed());

        let rawTransaction = {
            "from": _from,  //Откуда
            "gasPrice": web3.utils.toHex(gasPrice * 1e9), //Цена газа в блокчейне
            "gasLimit": web3.utils.toHex(15000), //Лимит газа, который использует транзакция
            "to": _to,
            "value": _amount,
            "chainId": _chainId//идентификатор/номер блокчейна 
        }

          
        let signedTx = await web3.eth.accounts.signTransaction(rawTransaction, '0x' + _privKey)
        let sentTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

        return sentTx
    }
}