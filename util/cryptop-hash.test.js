const cryptoHash = require('./crypto-hash');

describe('crytoHash()', () => {
    // hash for 'foo'
    const expHash = 'b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b';
    it('generate correct SHA-256 hash', () => {
        expect(cryptoHash('foo')).toEqual(expHash.toLowerCase());
    });

    it('generate the same hash with input of any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
    });

    // ensure a unique hash even if the same object
    it('produce a unique hash when the properties have changed in input', () => {
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo['a'] = 'foo';
        const newHash = cryptoHash(foo);

        expect(originalHash).not.toEqual(newHash);
    });

});