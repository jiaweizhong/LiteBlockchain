const Block = require('./block');
const {GENESIS_DATA} = require('./config');
const cryptoHash =require('./crypto-hash');

// test Block
describe('Block', () => {
    const timestamp = 'a-date';
    const lastHash = 'lastHash';
    const hash = 'hash';
    const data = ['data', 'blockchain data'];
    const block = new Block({timestamp,lastHash,hash,data});

    it('has timestamp/lastHash/Hash/data', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
    });
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
        expect(minedblock.hash).toEqual(cryptoHash(minedblock.timestamp,lastBlock.hash,data));
    });

});