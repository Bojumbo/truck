import { Router } from 'express';
import { TripController } from '../controllers/TripController.js';

const router = Router();

router.post('/event', TripController.createEvent);
router.get('/:shiftId', TripController.getByShift);

export default router;
