import express from 'express';
import {
  registerUser,
  loginUser,
  getSeatAvailability,
  bookSeat,
} from '../controllers/user.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/trains', authenticateToken, getSeatAvailability);
router.post('/bookings', authenticateToken, bookSeat);

export default router;
