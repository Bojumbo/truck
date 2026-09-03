import { Router } from 'express';
import { TachoController } from '../controllers/TachoController.js';

const router = Router();

router.post('/toggle', TachoController.toggle);
router.patch('/:id', TachoController.editStartTime);
router.get('/current', TachoController.getCurrent);

export default router;
