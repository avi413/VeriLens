"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("../../app/crypto/hash");
describe('sha256', () => {
    it('generates deterministic hashes', () => {
        const first = (0, hash_1.sha256)('verilens');
        const second = (0, hash_1.sha256)('verilens');
        expect(first).toEqual(second);
    });
    it('produces expected hash for known input', () => {
        expect((0, hash_1.sha256)('test')).toEqual('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
    });
});
