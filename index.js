const bodyParser = require('body-parser');
const express = require('express');
const Blockchain = require('./blockchain');


// express object to get request
const app = express();
const blockchain = new Blockchain();

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
    res.redirect('/api/blocks');
});

const PORT = 3000;
// listen to local host 3000
app.listen(PORT, (PORT) => {`listening at localhost:${PORT}`});