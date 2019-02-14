
// script to compare the string vs binary for difficulty
const Blockchain = require('./blockchain');

const blockchain = new Blockchain();

blockchain.addBlock({data:'inital block'});

let prevTime, nextBlock, nextTime, average, timeDiff;
const times = [];

for(let i = 0; i< 1000; i++){
    prevTime = blockchain.chain[blockchain.chain.length-1].timestamp;

    blockchain.addBlock({data:`block ${i}`});
    nextBlock = blockchain.chain[blockchain.chain.length-1];
    nextTime = nextBlock.timestamp;

    timeDiff = nextTime - prevTime;
    times.push(timeDiff);

    average = times.reduce((total, num) => (total + num))/times.length;
    console.log(`Time to mine block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average Time: ${average}ms`);
}