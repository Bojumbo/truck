import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ShiftController = {
  // POST /api/shifts/start
  async start(req, res) {
    try {
      const {
        truck_number,
        trailer_number,
        trailer_type,
        card_inserted_at,
        odometer_start,
        ref_hours_start,
      } = req.body;

      if (!truck_number || !trailer_type || !card_inserted_at || odometer_start === undefined) {
        return res.status(400).json({ error: 'Відсутні обов\'язкові поля' });
      }

      // Check for already active shift
      const existing = await prisma.shift.findFirst({
        where: { user_id: 1, status: 'active' },
      });
      if (existing) {
        return res.status(409).json({ error: 'Активна зміна вже існує', shift: existing });
      }

      const shift = await prisma.shift.create({
        data: {
          user_id: 1,
          truck_number,
          trailer_number: trailer_number || null,
          trailer_type,
          card_inserted_at: new Date(card_inserted_at),
          odometer_start: parseInt(odometer_start),
          ref_hours_start: ref_hours_start ? parseFloat(ref_hours_start) : null,
          status: 'active',
        },
      });

      return res.status(201).json(shift);
    } catch (err) {
      console.error('ShiftController.start error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },

  // POST /api/shifts/close
  async close(req, res) {
    try {
      const { shift_id, odometer_end, card_removed_at, ref_hours_end } = req.body;

      const shift = await prisma.shift.findFirst({
        where: { id: shift_id ? parseInt(shift_id) : undefined, user_id: 1, status: 'active' },
      });
      if (!shift) {
        return res.status(404).json({ error: 'Активна зміна не знайдена' });
      }

      // Close any open tacho log
      const openTacho = await prisma.tachoLog.findFirst({
        where: { shift_id: shift.id, end_time: null },
      });
      if (openTacho) {
        const now = new Date();
        const durationMinutes = Math.round((now - openTacho.start_time) / 60000);
        await prisma.tachoLog.update({
          where: { id: openTacho.id },
          data: { end_time: now, duration_minutes: durationMinutes },
        });
      }

      const updated = await prisma.shift.update({
        where: { id: shift.id },
        data: {
          odometer_end: odometer_end ? parseInt(odometer_end) : null,
          card_removed_at: card_removed_at ? new Date(card_removed_at) : new Date(),
          ref_hours_end: ref_hours_end ? parseFloat(ref_hours_end) : null,
          status: 'closed',
        },
      });

      return res.json(updated);
    } catch (err) {
      console.error('ShiftController.close error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },

  // GET /api/shifts/active
  async getActive(req, res) {
    try {
      const shift = await prisma.shift.findFirst({
        where: { user_id: 1, status: 'active' },
        include: {
          tacho_logs: { where: { end_time: null }, take: 1 },
        },
      });
      return res.json(shift || null);
    } catch (err) {
      console.error('ShiftController.getActive error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },

  // GET /api/shifts/current-report
  async getCurrentReport(req, res) {
    try {
      const shift = await prisma.shift.findFirst({
        where: { user_id: 1, status: 'active' },
        include: {
          tacho_logs: { orderBy: { start_time: 'asc' } },
          trip_logs: { orderBy: { timestamp: 'asc' } },
          expenses: { orderBy: { timestamp: 'asc' } },
        },
      });
      if (!shift) return res.status(404).json({ error: 'Немає активної зміни' });

      // Calculate tacho summaries
      const tachoSummary = { hammer: 0, bed: 0, driving: 0 };
      for (const log of shift.tacho_logs) {
        if (log.duration_minutes) {
          tachoSummary[log.mode] += log.duration_minutes;
        } else if (!log.end_time) {
          // Currently active
          tachoSummary[log.mode] += Math.round((new Date() - log.start_time) / 60000);
        }
      }

      const totalExpenses = { company: 0, personal: 0 };
      for (const exp of shift.expenses) {
        totalExpenses[exp.payment_type] += Number(exp.amount);
      }

      const kmDriven = shift.odometer_end
        ? shift.odometer_end - shift.odometer_start
        : null;

      return res.json({
        shift,
        summary: {
          tacho_minutes: tachoSummary,
          expenses_total: totalExpenses,
          km_driven: kmDriven,
          trip_events_count: shift.trip_logs.length,
        },
      });
    } catch (err) {
      console.error('ShiftController.getCurrentReport error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },

  // GET /api/shifts — history
  async list(req, res) {
    try {
      const shifts = await prisma.shift.findMany({
        where: { user_id: 1 },
        orderBy: { created_at: 'desc' },
        take: 50,
      });
      return res.json(shifts);
    } catch (err) {
      console.error('ShiftController.list error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },
};
