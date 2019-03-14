const Blockchain = require("./index");
const Block = require("./block");
const { cryptoHash } = require('../util');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

describe('Blockchain definition', () => {
    let blockchain, newChain, originChain, errorMock;

    beforeEach(() => {
       blockchain = new Blockchain();
       newChain = new Blockchain();
       errorMock = jest.fn();

       originChain = blockchain.chain;
       global.console.error = errorMock;
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
                    const hash = cryptoHash(timestamp,lastHash,data,nouce,difficulty);
                    const badBlock = new Block({timestamp, lastHash, hash, data, nouce, difficulty});
                    // add to the block chain
                    blockchain.chain.push(badBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false);
                });
            });
    
        });
    });

    describe('replaceChain()',() => {
        let logMock;
        beforeEach(()=>{
            // turn off the error & log printing
            logMock = jest.fn();
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

        describe('and the `validateTransactions` flag is true', () => {
            it('calls validTransactionData()', () => {
                const validTransactionDataMock = jest.fn();
                blockchain.validTransactionData = validTransactionDataMock;
                
                newChain.addBlock({data: 'foo'});
                blockchain.replaceChain(newChain.chain, true);
                expect(validTransactionDataMock).toHaveBeenCalled();
            });
        });
    });

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({recipient: 'foo-address', amount: 65});
            rewardTransaction = Transaction.rewardTransaction({minerWallet:wallet});
        });

        describe('and the transaction data is valid', () => {
            it('returns true', () => {
                newChain.addBlock({data:[transaction,rewardTransaction]});
                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe('and the transaction data has multiple rewards', () => {
            it('returns false and logs an error', () => {
                newChain.addBlock({data: [transaction, rewardTransaction, rewardTransaction]});
                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the transaction data has at least one malformed outputMap', () => {
            describe('and the transaction is not a reward transaction', () => {
                it('returns false and logs an error', () => {
                    transaction.outputMap[wallet.publicKey] = 99999;
                    newChain.addBlock({data: [transaction, rewardTransaction]});
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the transaction is a reward transaction', () => {
                it('returns false and logs an error', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 999999;
                    newChain.addBlock({data:[transaction,rewardTransaction]});
                    expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the transaction data has at least one malformed input', () => {
                it('returns false and logs an error', () => {
                    wallet.balance = 9000;

                    const evilOutputMap = {
                        [wallet.publicKey]: 8900,
                        fooRecipient: 100
                    }

                    const evilTransaction = {
                        input: {
                            timestamp: Date.now(),
                            amount: wallet.balance,
                            address: wallet.publicKey,
                            signature: wallet.sign(evilOutputMap)
                        },
                        outputMap: evilOutputMap
                    }

                    newChain.addBlock({data: [evilTransaction, rewardTransaction]});
                    expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and a block contains multiple identical transactions', () => {
                it('returns false and logs an error', () => {
                    newChain.addBlock({
                        data: [transaction,transaction,transaction,rewardTransaction]
                    });

                    expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });
    });
});

