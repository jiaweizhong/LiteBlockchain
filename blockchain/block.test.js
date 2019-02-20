const hex2bin = require('hex-to-binary');
const Block = require('./block');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const { cryptoHash } =require('../util');

// test Block
describe('Block', () => {
    const timestamp = 2000;  // timestamp to be digit
    const lastHash = 'lastHash';
    const hash = 'hash';
    const data = ['data', 'blockchain data'];
    const nouce = 1;
    const difficulty = 1;
    const block = new Block({timestamp,lastHash,hash,nouce, difficulty, data});

    it('has timestamp/lastHash/Hash/data', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nouce).toEqual(nouce);
        expect(block.difficulty).toEqual(difficulty);
    });

    // test genesis block
    describe('genesis()', () => {
        const genesisBlock = Block.genesis();
        // print the genesis block
        console.log('genesisBlock:',genesisBlock);

        it('is a instance of Block', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    // test mineBlock
    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = "mined data";
        const minedblock = Block.mineBlock({lastBlock, data});

        it('is a instance of Block', () => {
            expect(minedblock instanceof Block).toBe(true);
        });

        it('set the `lastHash` to be the `hash` of last block', () => {
            expect(minedblock.lastHash).toEqual(lastBlock.hash);
        });

        it('set the `data` to be the `data`', () => {
            expect(minedblock.data).toEqual(data);
        });

        it('set a `timestamp`', () => {
            expect(minedblock.timestamp).not.toEqual(undefined);
        });

        it('create a proper SHA-256 `hash` based on the proper input', () => {
            expect(minedblock.hash).toEqual(cryptoHash(
                minedblock.timestamp,
                minedblock.nouce, 
                minedblock.difficulty,
                lastBlock.hash, 
                data
                ));
        });

        it('set the `hash` to match the difficulty criteria', () => {
            expect(hex2bin(minedblock.hash).substring(0, minedblock.difficulty))
            .toEqual('0'.repeat(minedblock.difficulty));
        })

        // the adjustDifficulty() should be called when mining a block
        it('adjust the difficulty', () => {
            const possibleResults = [lastBlock.difficulty+1, lastBlock.difficulty - 1];
            expect(possibleResults.includes(minedblock.difficulty)).toBe(true);
        });

    describe('adjustDifficulty()', () => {
        it('increases the difficulty for a fast mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock:block,
                timestamp:block.timestamp + MINE_RATE -100
            })).toEqual(block.difficulty + 1);
        });

        it('decreases the difficulty for a slowly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock:block,
                timestamp:block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });

        it('the difficulty cannot be lower than 1', () => {
            block.difficulty = -1;
            expect(Block.adjustDifficulty({originalBlock:block})).toEqual(1);
        });
    });
    });
});