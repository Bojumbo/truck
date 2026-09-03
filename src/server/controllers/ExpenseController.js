import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

export const ExpenseController = {
  // POST /api/expenses
  async create(req, res) {
    try {
      const { shift_id, payment_type, category, amount, currency, comment, timestamp } = req.body;
      const receipt_photo_url = req.file ? `/uploads/${req.file.filename}` : null;

      if (!shift_id || !payment_type || !category || amount === undefined) {
        return res.status(400).json({ error: 'shift_id, payment_type, category та amount є обов\'язковими' });
      }

      const expense = await prisma.expense.create({
        data: {
          shift_id: parseInt(shift_id),
          payment_type,
          category,
          amount: parseFloat(amount),
          currency: currency || 'EUR',
          comment: comment || null,
          receipt_photo_url,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        },
      });

      return res.status(201).json(expense);
    } catch (err) {
      console.error('ExpenseController.create error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },

  // GET /api/expenses/:shiftId
  async getByShift(req, res) {
    try {
      const { shiftId } = req.params;
      const expenses = await prisma.expense.findMany({
        where: { shift_id: parseInt(shiftId) },
        orderBy: { timestamp: 'asc' },
      });
      return res.json(expenses);
    } catch (err) {
      console.error('ExpenseController.getByShift error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },
};
