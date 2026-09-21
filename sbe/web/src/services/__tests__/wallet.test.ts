import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WalletService } from '../wallet';
import { db } from '../../db/index';

vi.mock('../../db/index', () => {
  return {
    db: {
      transaction: vi.fn(),
    },
  };
});

describe('WalletService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('lockFunds', () => {
    it('throws "Insufficient balance" when update affects 0 rows', async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'mock-wallet-id' }]),
      };

      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({ rowCount: 0 }), // Simulates balance condition failure
      };

      const mockTx = {
        select: vi.fn().mockReturnValue(selectChain),
        update: vi.fn().mockReturnValue(updateChain),
        insert: vi.fn().mockReturnThis(),
      };

      (db.transaction as any).mockImplementation(async (cb: any) => {
        return cb(mockTx);
      });

      await expect(
        WalletService.lockFunds('mock-user-id', '100', 'mock-order-id', 'stake', 'INR')
      ).rejects.toThrow('Insufficient balance in INR');

      expect(mockTx.select).toHaveBeenCalled();
      expect(mockTx.update).toHaveBeenCalled();
    });

    it('successfully locks funds when update affects > 0 rows', async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'mock-wallet-id' }]),
      };

      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({ rowCount: 1 }), // Simulates balance condition failure
      };

      const insertChain = {
        values: vi.fn().mockResolvedValue([{ id: 'mock-ledger-id' }]),
      };

      const mockTx = {
        select: vi.fn().mockReturnValue(selectChain),
        update: vi.fn().mockReturnValue(updateChain),
        insert: vi.fn().mockReturnValue(insertChain),
      };

      (db.transaction as any).mockImplementation(async (cb: any) => {
        return cb(mockTx);
      });

      const result = await WalletService.lockFunds('mock-user-id', '100', 'mock-order-id', 'stake', 'INR');

      expect(result).toEqual({ success: true });
      expect(mockTx.select).toHaveBeenCalled();
      expect(mockTx.update).toHaveBeenCalled();
      expect(mockTx.insert).toHaveBeenCalled();
    });

    it('throws "Wallet not found" when wallet does not exist', async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      const mockTx = {
        select: vi.fn().mockReturnValue(selectChain),
      };

      (db.transaction as any).mockImplementation(async (cb: any) => {
        return cb(mockTx);
      });

      await expect(
        WalletService.lockFunds('mock-user-id', '100', 'mock-order-id', 'stake', 'INR')
      ).rejects.toThrow('Wallet not found for currency INR');

      expect(mockTx.select).toHaveBeenCalled();
    });
  });
});
