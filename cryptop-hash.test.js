const cryptoHash = require('./crypto-hash');

describe('crytoHash()', () => {
    // hash for 'foo'
    const expHash = '2C26B46B68FFC68FF99B453C1D30413413422D706483BFA0F98A5E886266E7AE';
    it('generate correct SHA-256 hash', () => {
        expect(cryptoHash('foo')).toEqual(expHash.toLowerCase());
    });

    it('generate the same hash with input of any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
    });
});