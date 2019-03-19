const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const path = require('path');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionMiner = require('./app/transaction-miner');
const TransactionPool = require('./wallet/transaction-pool');
const Walllet = require('./wallet/index');

const isDevelopment = process.env.ENV === 'development';
const REDIS_URL = isDevelopment ?
    'redis://127.0.0.1:6379':
    'redis://h:p1a8c46483fc0d6a06278441199df3fa9a4e2de59ed0f0a5955b4fb73667a032e@ec2-18-233-35-75.compute-1.amazonaws.com:10789'

// root node address
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

// express object to get request
const app = express();
const blockchain = new Blockchain();
const wallet = new Walllet();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool, redisUrl: REDIS_URL });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

app.use(bodyParser.json());
// adding middleware to allow access to all js files
app.use(express.static(path.join(__dirname, 'client/dist')));

// get response
app.get('/api/blocks', (req, res) => {
    // send back a blockchain
    res.json(blockchain.chain);
});

// pagination
app.get('/api/blocks/length', (req, res) => {
    res.json(blockchain.chain.length);
});

app.get('/api/blocks/:id', (req, res) => {
    const { id } = req.params;
    const { length } = blockchain.chain;

    const blocksReversed = blockchain.chain.slice().reverse();

    let startIndex = (id-1) * 5;
    let endIndex = id * 5;

    startIndex = startIndex < length ? startIndex : length;
    endIndex = endIndex < length ? endIndex : length;

    res.json(blocksReversed.slice(startIndex, endIndex));
});

// post data
app.post('/api/mine', (req, res) => {
    // get data from user req
    const {data} = req.body;
    blockchain.addBlock({data});
    // broadcast chain when new block is mined
    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

// get wallet info
app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey

    res.json({
        address,
        balance: Walllet.calculateBalance({chain:blockchain.chain, address: wallet.publicKey})
    });
});

// create transaction
app.post('/api/transact', (req, res) => {
    const { amount, recipient } = req.body;
    let transaction = transactionPool
        .existingTransaction({ inputAddress: wallet.publicKey });

    try{ // handle the error more gracefully
        if(transaction){
            transaction.update( {senderWallet: wallet, recipient, amount} );
        }
        else{
            transaction = wallet.createTransaction({ 
                recipient, 
                amount, 
                chain: blockchain.chain });
        }
    }catch(error){ // return to skip the rest of code
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(transaction)

    // broadcast the transaction if it's valid
    pubsub.broadcastTransaction(transaction);

    res.json({ type: 'success', transaction });
});

// create transaction-pool-map
app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();
    res.redirect('/api/blocks');
});

// add known address in the network
app.get('/api/known-address', (req, res) => {
    const addressMap = {};
    for(let block of blockchain.chain){
        for(let transaction of block.data){
            const recipient = Object.keys(transaction.outputMap);

            recipient.forEach(recipient => addressMap[recipient] = recipient);
        }
    }

    res.json(Object.keys(addressMap));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,'client/dist/index.html'));
});

// sync with root chain
const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, ( error, response, body ) => {
        console.log(`Calling syncWithRootState...:${ROOT_NODE_ADDRESS}/api/blocks`);
        if(!error && response.statusCode === 200){
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }else{
            console.log('Request successful!  Error:', error);
        }
    });

    // sync root transaction pool map with new peer
    request({ url:`${ROOT_NODE_ADDRESS }/api/transaction-pool-map`}, (error, response, body) => {
        console.log(`Calling syncWithRootState...:${ROOT_NODE_ADDRESS}/api/transaction-pool-map`);
        if(!error && response.statusCode === 200){
            const rootTransactionPoolMap = JSON.parse(body);
            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap); 
        }else{
            console.log('Request successful!  Error:', error);
        }
    });
};

// only run in development mode
if(isDevelopment){
    const walletFoo = new Walllet();
    const walletBar = new Walllet();

    const generateWalletTransaction = ({ wallet, recipient, amount}) => {
        const transaction = wallet.createTransaction({
            recipient, amount, chain: blockchain.chain
        });

        transactionPool.setTransaction(transaction);
    };

    const walletAction = () => generateWalletTransaction({
        wallet, recipient: walletFoo.publicKey, amount: 5
    });

    const walletFooAction = () => generateWalletTransaction({
        wallet: walletFoo, recipient: walletBar.publicKey, amount: 10
    });

    const walletBarAction = () => generateWalletTransaction({
        wallet: walletBar, recipient: wallet.publicKey, amount: 15
    });

    for(let i=0; i<20; i++){
        if(i%3 === 0){
            walletAction();
            walletFooAction();
        }else if(i%3 === 1){
            walletAction();
            walletBarAction();
        }else{
            walletFooAction();
            walletBarAction();
        }

        transactionMiner.mineTransactions();
    }
}

let PEER_PORT;
// generate random peer port starting from 3000 - 4000
if(process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
// listen to local host 3000
app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);
    // only the not default port sync to default port
    if(PORT !== DEFAULT_PORT){
        syncWithRootState();
    }
});