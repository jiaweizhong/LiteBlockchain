const redis = require('redis');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
}

class PubSub{
    constructor({ blockchain, transactionPool }){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscribeToChannel();

        this.subscriber.on('message',
            (channel, message) => this.handelMessage(channel, message)
        );
    }

    handelMessage(channel, message){    
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
        const parseMessage = JSON.parse(message); // parse blockchain info

        switch(channel){
            case CHANNELS.BLOCKCHAIN: // replace the blockchain if receive a valid blockchain
                this.blockchain.replaceChain(parseMessage, () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parseMessage
                    });
                });
                break;
            case CHANNELS.TRANSACTION: // set transaction if receive a transaction
                this.transactionPool.setTransaction(parseMessage);
                break;
            default:
                return;
        }

    }

    subscribeToChannel(){
        // subscribe all the channels
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        });
    }
    // publish message
    publish({channel, message}){
        this.subscriber.unsubscribe(channel, () => {
            // unsubscribe to itself then publish
            this.publisher.publish(channel, message, () => {
                // subscribe back after publishing
                this.subscriber.subscribe(channel);
            });
        });
       
    }
    // blockchain should broadcast everytime a block is mined
    broadcastChain(){
        this.publish({
            channel:  CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    // blockchain should broadcast transaction to the network
    broadcastTransaction(transaction){
        this.publish({
            channel:  CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        });
    }
}

module.exports = PubSub;