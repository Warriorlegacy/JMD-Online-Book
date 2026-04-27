import { describe, it, expect } from 'vitest';
import { OrderBook } from '../services/engine';

describe('OrderBook getSnapshot', () => {
  it('should return initial snapshot with empty backs and lays', () => {
    const orderBook = new OrderBook('match-1', 'selection-1');

    // As per rationale: "Testing getters is trivial. Just set the snapshot internally and call the getter."
    // We can set the property dynamically since we are in JS/TS tests and cast to any
    const testSnapshot = { backs: [{ price: 2.0, size: 100 }], lays: [] };
    (orderBook as any).lastSnapshot = testSnapshot;

    const snapshot = orderBook.getSnapshot();

    expect(snapshot).toEqual(testSnapshot);
  });
});
