const web3 = require("@solana/web3.js")
const splToken = require("@solana/spl-token");

const bs58 = require('bs58');



class Transactions {

    async sendNative(_privateKey, _to, _amount) {
        // 1. Create connection with network
        let connection = new web3.Connection(web3.clusterApiUrl("testnet"));

        // 2. Modify address
        let fromAddress = web3.Keypair.fromSecretKey(bs58.decode(_privateKey))

        // 3. Create tx object
        let transaction = new web3.Transaction();

        // 4. Add new tx to object
        transaction.add(
            web3.SystemProgram.transfer({
              fromPubkey: fromAddress.publicKey,
              toPubkey: _to, 
              lamports: Number(_amount * 1000000000), // 1000000000 = 1 sol
            })
        )
        // 5. Sign and send transaction
        const signature = await web3.sendAndConfirmTransaction(connection, transaction, [fromAddress]);
        console.log(
            '\x1b[32m', 
            `   Transaction Success!🎉`,
            `\n    https://explorer.solana.com/tx/${signature}?cluster=testnet`
        );

        return signature

    }


    async sendToken(_privateKey, _tokenAddress, _toAddress, _amount) {

        // 1. Create connection
        let connection = new web3.Connection(web3.clusterApiUrl("testnet"));

        // 2. Modify addresses
        let fromAddress = web3.Keypair.fromSecretKey(bs58.decode(_privateKey))
        let toAddress = new web3.PublicKey(bs58.decode(_toAddress));
        let tokenAddress = new web3.PublicKey(bs58.decode(_tokenAddress)); 
        
        // 3. Create associated accounts
        let fromAccount = await splToken.getOrCreateAssociatedTokenAccount (
            connection, 
            fromAddress,
            tokenAddress,
            fromAddress.publicKey
        );
  
        let toAccount = await splToken.getOrCreateAssociatedTokenAccount (
            connection, 
            fromAddress,
            tokenAddress,
            toAddress
        );

        // 4. Get token decimals
        const tokenInfo = await connection.getParsedAccountInfo(tokenAddress);
        const numberDecimals = (tokenInfo.value?.data).parsed.info.decimals;

        // 5. Create tx
        const tx = new web3.Transaction();

        tx.add(splToken.createTransferInstruction (
            fromAccount.address,
            toAccount.address,
            fromAddress.publicKey,
            _amount * Math.pow(10, numberDecimals)
        ))
        const latestBlockHash = await connection.getLatestBlockhash('confirmed');
        tx.recentBlockhash = latestBlockHash.blockhash;

        // 6. Sign and send tx
        const signature = await web3.sendAndConfirmTransaction(connection, tx, [fromAddress]);
        console.log(
            '\x1b[32m', 
            `   Transaction Success!🎉`,
            `\n    https://explorer.solana.com/tx/${signature}?cluster=testnet`
        );

        return signature
  
    }
     
}

module.exports = Transactions