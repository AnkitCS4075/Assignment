import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}

const generateToken = (user: IUser): string => {
  return jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    // Validate password length
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    
    if (existingUser) {
      // If the existing user is a guest, update it to a regular account
      if (existingUser.isGuest) {
        existingUser.name = name;
        existingUser.password = password;
        existingUser.isGuest = false;
        await existingUser.save();
        
        const token = generateToken(existingUser);
        res.json({
          user: {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            isGuest: existingUser.isGuest
          },
          token
        });
        return;
      }
      // If it's a regular account, don't allow registration
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create new user if doesn't exist
    const user = new User({
      name,
      email: normalizedEmail,
      password
    });

    await user.save();
    const token = generateToken(user);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    // Validate password length
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
};

export const guestLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if the email exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    
    if (existingUser) {
      // If user exists but is not a guest, don't allow guest login
      if (!existingUser.isGuest) {
        res.status(400).json({ error: 'This email is registered with a regular account. Please login instead.' });
        return;
      }
      // If user exists and is a guest, generate new token and return
      const token = generateToken(existingUser);
      res.json({
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          isGuest: existingUser.isGuest
        },
        token
      });
      return;
    }

    // Create new guest user if doesn't exist
    const randomPassword = Math.random().toString(36).slice(-8);
    const user = new User({
      name: 'Guest User',
      email: normalizedEmail,
      password: randomPassword,
      isGuest: true
    });

    await user.save();
    const token = generateToken(user);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest
      },
      token
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(400).json({ error: 'Guest login failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to get profile' });
  }
};

export const convertGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const userId = (req as AuthRequest).user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate password length
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Find and update the guest user
    const user = await User.findById(userId);
    
    if (!user || !user.isGuest) {
      res.status(400).json({ error: 'Only guest accounts can be converted' });
      return;
    }

    // Update user information
    user.name = name;
    user.password = password;
    user.isGuest = false;

    await user.save();
    const token = generateToken(user);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest
      },
      token
    });
  } catch (error) {
    console.error('Convert guest error:', error);
    res.status(400).json({ error: 'Failed to convert guest account' });
  }
}; 