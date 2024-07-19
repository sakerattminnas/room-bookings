import { DateTime, Duration, today } from './date'

describe('testing DateTime', () => {
    test('to date string', () => {
        expect(new DateTime("2024-07-04").dateString).toBe("2024-07-04");
    })
});
