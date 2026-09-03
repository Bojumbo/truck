import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TripController = {
  // POST /api/trip/event
  async createEvent(req, res) {
    try {
      const { shift_id, event_type, border_name, odometer, comment, timestamp } = req.body;

      if (!shift_id || !event_type || odometer === undefined) {
        return res.status(400).json({ error: 'shift_id, event_type та odometer є обов\'язковими' });
      }

      const validTypes = [
        'transit_start', 'transit_end',
        'border_crossing',
        'loading_start', 'loading_end',
        'unloading_start', 'unloading_end',
      ];
      if (!validTypes.includes(event_type)) {
        return res.status(400).json({ error: `Невалідний тип події: ${event_type}` });
      }

      if (event_type === 'border_crossing' && !border_name) {
        return res.status(400).json({ error: 'border_name є обов\'язковим для перетину кордону' });
      }

      const tripLog = await prisma.tripLog.create({
        data: {
          shift_id: parseInt(shift_id),
          event_type,
          border_name: border_name || null,
          odometer: parseInt(odometer),
          comment: comment || null,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        },
      });

      return res.status(201).json(tripLog);
    } catch (err) {
      console.error('TripController.createEvent error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },

  // GET /api/trip/:shiftId
  async getByShift(req, res) {
    try {
      const { shiftId } = req.params;
      const logs = await prisma.tripLog.findMany({
        where: { shift_id: parseInt(shiftId) },
        orderBy: { timestamp: 'asc' },
      });
      return res.json(logs);
    } catch (err) {
      console.error('TripController.getByShift error:', err);
      return res.status(500).json({ error: 'Помилка сервера', details: err.message });
    }
  },
};
