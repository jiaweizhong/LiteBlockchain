const Wallet = require('./index');
const { verifySignature } = require('../util');

describe('Wallet', () => {

    let wallet;

    beforeEach( () => {
        wallet = new Wallet();
    });

    it('it has a property of `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('it has a property of `publicKey`', () => {
        console.log("Public Key:",wallet.publicKey);
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'foobar';

        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        it('does not verify a invalid data', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(true);
        });
    });

});