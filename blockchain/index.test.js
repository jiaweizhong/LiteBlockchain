const Blockchain = require("./index");
const Block = require("./block");
const crytoHash = require('../util/crypto-hash');

describe('Blockchain definition', () => {
    let blockchain, newChain, originChain;

    beforeEach(() => {
       blockchain = new Blockchain();
       newChain = new Blockchain();
       originChain = blockchain.chain;
    });

    it('is a instance of Array', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('first block is genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('addBlock() append new block to the end', () => {
        const data = 'foo';
        // add new block to the chain
        blockchain.addBlock({data});
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(data);
    });

    describe('isValidChain()',() => {

        describe('when the chain does not start with gensis block', () => {
            it('return false', () => {
                blockchain.chain[0] = new Block('fake-gensis');
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });
    
        describe('when the chain start with gensis with multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({data:'Beer'});
                blockchain.addBlock({data:'Beats'});
                blockchain.addBlock({data:'Tiger'});
            });
    
            describe('the last chain reference has changes', () => {
                it('return false', () => {
                    blockchain.chain[2].lastHash = 'fake-hash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
    
            describe('the chain contains a block with invalid field', () => {
    
                it('return false', () => {
                    blockchain.chain[0].data = 'fake-data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
    
            describe('the chain does not contain invalid blocks',() => {
                it('return true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });

            describe('the chain contains a block with jump difficulty', () => {
                it('return false', () => {
                    // generate bad block
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];
                    const timestamp = Date.now();
                    const lastHash = lastBlock.hash;
                    const data = [];
                    const nouce = 0;
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = crytoHash(timestamp,lastHash,data,nouce,difficulty);
                    const badBlock = new Block({timestamp, lastHash, hash, data, nouce, difficulty});
                    // add to the block chain
                    blockchain.chain.push(badBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false);
                });
            });
    
        });
    });

    describe('replaceChain()',() => {
        let errorMock, logMock;
        beforeEach(()=>{
            // turn off the error & log printing
            errorMock = jest.fn();
            logMock = jest.fn();
            global.console.error = errorMock;
            global.console.log = logMock;
        });

        describe('when the new chain is not longer than the old chain', () => {
            beforeEach(() => {
                newChain.chain[0] = {new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            });
            
            it('does not replace it', () => {
                expect(blockchain.chain).toEqual(originChain);
            });

            it('throws an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('when the new chain is longer than the old chain', () => {

            beforeEach(() => {
                newChain.addBlock({data:'Beer'});
                newChain.addBlock({data:'Beats'});
                newChain.addBlock({data:'Tiger'});
            });

            describe('when the new chain is not valid',() => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'fake-hash';
                    blockchain.replaceChain(newChain.chain);
                });

                it('dose not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originChain);
                });

                it('throws an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('when the new chain is valid',() => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('throws an error', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });
    });
});

