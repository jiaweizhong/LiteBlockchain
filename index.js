const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');

// express object to get request
const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({blockchain});

// root node address
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://local-host:${DEFAULT_PORT}`;

// Experiment code:
// setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(bodyParser.json());
// get response
app.get('/api/blocks', (req, res) => {
    // send back a blockchain
    res.json(blockchain.chain);
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

// sync with root chain
const syncChain = () => {
    request({url:`${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        if(!error && response.statusCode == 200){
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
};

let PEER_PORT;
// generate random peer port starting from 3000 - 4000
if(process.env.GENERATE_PEER_PORT === "true"){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
// listen to local host 3000
app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);
    // only the not default port sync to default port
    if(PORT !== DEFAULT_PORT){
        syncChain();
    }
});