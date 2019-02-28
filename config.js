const INIT_DIFFICULTY = 3;
const MINE_RATE = 1000;

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '------',
    difficulty: INIT_DIFFICULTY,
    nouce: 0,
    hash: 'hash-one',
    data: []
};


const STARTING_BALANCE = 1000;

// only use the address to differentiate the reward
const REWARD_INPUT = { address: '*authorized-reward*' };

const MINING_REWARD = 50;

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE, REWARD_INPUT, MINING_REWARD };