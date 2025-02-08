import express from 'express';
import { body } from 'express-validator';
import { register, login, guestLogin, getProfile, convertGuest } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/guest-login', guestLogin);
router.get('/profile', auth, getProfile);
router.post('/convert-guest', auth, convertGuest);

export default router; 