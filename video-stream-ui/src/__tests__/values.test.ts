import { describe, it, expect } from 'vitest';
import { getSizeValue } from '@/util/values';

describe('getSizeValue', () => {
    it('returns 640px for Small', () => {
        expect(getSizeValue('Small')).toBe('640px');
    });

    it('returns 864px for Normal', () => {
        expect(getSizeValue('Normal')).toBe('864px');
    });

    it('returns 1138px for Large', () => {
        expect(getSizeValue('Large')).toBe('1138px');
    });

    it('returns 1280px for Huge', () => {
        expect(getSizeValue('Huge')).toBe('1280px');
    });

    it('returns 864px for unknown size (default case)', () => {
        expect(getSizeValue('Unknown')).toBe('864px');
    });

    it('returns 864px when no size is provided', () => {
        expect(getSizeValue()).toBe('864px');
    });

    it('applies the add offset to the size', () => {
        expect(getSizeValue('Small', 100)).toBe('740px');
        expect(getSizeValue('Normal', 36)).toBe('900px');
        expect(getSizeValue('Large', 0)).toBe('1138px');
    });
});
