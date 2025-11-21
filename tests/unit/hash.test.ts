import { sha256 } from '../../app/crypto/hash';

describe('sha256', () => {
  it('generates deterministic hashes', () => {
    const first = sha256('verilens');
    const second = sha256('verilens');
    expect(first).toEqual(second);
  });

  it('produces expected hash for known input', () => {
    expect(sha256('test')).toEqual('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  });
});
