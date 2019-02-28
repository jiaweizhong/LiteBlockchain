const Block = require('./block');
const {cryptoHash} = require('../util');

class Blockchain{
    constructor(){
      this.chain = [Block.genesis()];
    }

    addBlock({data}){
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1], 
            data: data});
        // push into chain
        this.chain.push(newBlock);
    }

    replaceChain(chain, onSuccess){
        if(chain.length<=this.chain.length){
            console.error('The incoming chain must be longer');
            return;
        }

        if(!Blockchain.isValidChain(chain)){
            console.error('The incoming chain must be valid');
            return;
        }

        if(onSuccess) onSuccess();
        // replace the current chain when it's longer & valid
        console.log('replacing chain with:',chain);
        this.chain = chain;
    }

    static isValidChain(chain){
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){
            return false;
        }

        for(let i = 1; i < chain.length; i++){
            const {timestamp, lastHash, hash, nouce, difficulty, data} = chain[i];
            const expLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;

            // each block lastHash equals last block hash
            if(lastHash !== expLastHash) return false;
            // diffculty cannot jump (security check)
            if(lastDifficulty - difficulty > 1) return false;

            // each block hash should match SHA256
            const expCurHash = cryptoHash(timestamp, lastHash, data, nouce, difficulty);
            if(hash!==expCurHash) return false;
        }
    
        return true;
    }
}

module.exports = Blockchain;