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

module.exports = { GENESIS_DATA, MINE_RATE };