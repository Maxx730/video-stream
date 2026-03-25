import { describe, it, expect } from 'vitest';
import { getRandomQuote, Quotes } from '@/data/empty_quotes';

describe('getRandomQuote', () => {
    it('returns a quote from the source array', () => {
        const result = getRandomQuote(Quotes);
        expect(Quotes).toContain(result);
    });

    it('returns an object with quote and source fields', () => {
        const result = getRandomQuote(Quotes);
        expect(result).toHaveProperty('quote');
        expect(result).toHaveProperty('source');
    });

    it('returns a string for quote and source', () => {
        const result = getRandomQuote(Quotes);
        expect(typeof result.quote).toBe('string');
        expect(typeof result.source).toBe('string');
    });

    it('always returns from the global Quotes array regardless of the argument passed', () => {
        // Note: getRandomQuote has a bug where it ignores the source param
        // and always reads from the global Quotes array. This test documents that behaviour.
        const custom = [{ quote: 'Unreachable', source: 'Never' }];
        const result = getRandomQuote(custom);
        expect(Quotes).toContain(result);
    });
});
