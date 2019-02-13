const {GENESIS_DATA, MINE_RATE} = require('./config');
const cryptoHash = require('./crypto-hash');

class Block {
    constructor({timestamp, lastHash, hash, data, nouce, difficulty}){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nouce = nouce;
        this.difficulty = difficulty;
    }
    // get the genesis
    static genesis(){
        return new this(GENESIS_DATA);
    }
    // mine block function
    static mineBlock({lastBlock, data}){
        const lastHash = lastBlock.hash;
        let hash, timestamp;
        let {difficulty} = lastBlock;
        let nouce = 0;
        // work of proot -- computation cost to mine a block
        do{
            nouce++;
            timestamp = Date.now();
            // adjust the difficulty when mining
            difficulty = Block.adjustDifficulty({originalBlock:lastBlock, timestamp});
            hash = cryptoHash(timestamp,lastHash,data,nouce,difficulty);
        }while(hash.substring(0, difficulty)!=='0'.repeat(difficulty));

        return new this({timestamp,lastHash,data,difficulty,nouce,hash});
    }
    // adjust the difficulty according to the time difference
    static adjustDifficulty({originalBlock, timestamp}){
        const {difficulty} = originalBlock;        
        if(difficulty < 1) return 1; // difficulty cannot lower than 1

        if(timestamp - originalBlock.timestamp > MINE_RATE) 
            return difficulty - 1;
        else 
            return difficulty + 1;
    }

}

module.exports = Block;