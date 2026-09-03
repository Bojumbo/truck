import { Router } from 'express';
import { ShiftController } from '../controllers/ShiftController.js';

const router = Router();

router.post('/start', ShiftController.start);
router.post('/close', ShiftController.close);
router.get('/active', ShiftController.getActive);
router.get('/current-report', ShiftController.getCurrentReport);
router.get('/', ShiftController.list);

export default router;
