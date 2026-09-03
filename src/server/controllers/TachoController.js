import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TachoController = {
  // POST /api/tacho/toggle
  // Body: { shift_id, mode: 'hammer' | 'bed' | 'driving' }
  async toggle(req, res) {
    try {
      const { shift_id, mode } = req.body;

      if (!shift_id || !mode) {
        return res.status(400).json({ error: 'shift_id та mode є обов\'язковими' });
      }

      const validModes = ['hammer', 'bed', 'driving'];
      if (!validModes.includes(mode)) {
        return res.status(400).json({ error: `Невалідний режим: ${mode}` });
      }

      const now = new Date();

      // 1. Close any currently open tacho log for this shift
      const openLog = await prisma.tachoLog.findFirst({
        where: { shift_id: parseInt(shift_id), end_time: null },
      });

      if (openLog) {
        // If same mode is clicked again — do nothing (idempotent)
        if (openLog.mode === mode) {
          return res.json({
            message: 'Режим вже активний',
            current: openLog,
            previous: null,
          });
        }

        const durationMinutes = Math.round((now - openLog.start_time) / 60000);
        await prisma.tachoLog.update({
          where: { id: openLog.id },
          data: { end_time: now, duration_minutes: durationMinutes },
        });
      }

      // 2. Create new tacho log with the new mode
      const newLog = await prisma.tachoLog.create({
        data: {
          shift_id: parseInt(shift_id),
          mode,
          start_time: now,
          end_time: null,
          duration_minutes: null,
        },
      });

      return res.status(201).json({
        message: 'Режим змінено',
        current: newLog,
        previous: openLog || null,
      });
    } catch (err) {
      console.error('TachoController.toggle error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },

  // PATCH /api/tacho/:id — edit start_time of a tacho log
  async editStartTime(req, res) {
    try {
      const { id } = req.params;
      const { start_time } = req.body;

      if (!start_time) {
        return res.status(400).json({ error: 'start_time є обов\'язковим' });
      }

      const log = await prisma.tachoLog.findUnique({ where: { id: parseInt(id) } });
      if (!log) return res.status(404).json({ error: 'Запис не знайдено' });

      // Recalculate duration if end_time exists
      const newStart = new Date(start_time);
      let duration_minutes = log.duration_minutes;
      if (log.end_time) {
        duration_minutes = Math.round((log.end_time - newStart) / 60000);
      }

      const updated = await prisma.tachoLog.update({
        where: { id: parseInt(id) },
        data: { start_time: newStart, duration_minutes },
      });

      return res.json(updated);
    } catch (err) {
      console.error('TachoController.editStartTime error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },

  // GET /api/tacho/current?shift_id=X
  async getCurrent(req, res) {
    try {
      const { shift_id } = req.query;
      if (!shift_id) return res.status(400).json({ error: 'shift_id є обов\'язковим' });

      const current = await prisma.tachoLog.findFirst({
        where: { shift_id: parseInt(shift_id), end_time: null },
      });

      const recent = await prisma.tachoLog.findMany({
        where: { shift_id: parseInt(shift_id) },
        orderBy: { start_time: 'desc' },
        take: 10,
      });

      return res.json({ current: current || null, recent });
    } catch (err) {
      console.error('TachoController.getCurrent error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },
};
