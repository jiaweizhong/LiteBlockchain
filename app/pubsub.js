const redis = require('redis');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
}

class PubSub{
    constructor({blockchain}){
        this.blockchain = blockchain;
        
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscribeToChannel();

        this.subscriber.on('message',
            (channel, message) => this.handelMessage(channel, message)
        );
    }
    // replace the blockchain if receive a valid blockchain
    handelMessage(channel, message){    
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
        const parseMessage = JSON.parse(message); // parse blockchain info
        if(channel=== CHANNELS.BLOCKCHAIN){
            this.blockchain.replaceChain(parseMessage);
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
}

module.exports = PubSub;