const bodyParser = require('body-parser');
const express = require('express');
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');

// express object to get request
const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({blockchain});

setTimeout(() => pubsub.broadcastChain(), 1000);

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

const DEFAULT_PORT = 3000;
let PEER_PORT;
// generate random peer port starting from 3000 - 4000
if(process.env.GENERATE_PEER_PORT === "true"){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
// listen to local host 3000
app.listen(PORT, () => console.log(`listening at localhost:${PORT}`));