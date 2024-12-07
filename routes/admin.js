import express from 'express';
import { addTrain } from '../controllers/admin.js';
import { validateApiKeyWithService } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/trains', validateApiKeyWithService, addTrain);

export default router;
