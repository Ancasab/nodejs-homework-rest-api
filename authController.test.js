import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from './models/users.js';
import { login } from './controller/authController.js';

describe('Auth Controller - Login', () => {  

  const mockUser = {
    _id: '12345',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    subscription: 'starter',
  };

  beforeEach(() => {  
    vi.clearAllMocks();
  });

  it('should return a token and user details', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    vi.spyOn(jwt, 'sign').mockReturnValue('mocked_token');
    vi.spyOn(User, 'findByIdAndUpdate').mockResolvedValue(mockUser);

    const data = { email: 'test@example.com', password: 'password123' };
    const result = await login(data);

    expect(result).toBe('mocked_token');
    expect(User.findOne).toHaveBeenCalledWith({ email: data.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(data.password, mockUser.password);
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUser._id, email: mockUser.email },
      process.env.TOKEN_SECRET,
      { expiresIn: '1h' }
    );
  });

  it('should throw an error if email is incorrect', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(null);

    const data = { email: 'wrong@example.com', password: 'password123' };
    await expect(login(data)).rejects.toThrow("Email or password is incorrect");
  });

  it('should throw an error if password is incorrect', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const data = { email: 'test@example.com', password: 'wrongpassword' };
    await expect(login(data)).rejects.toThrow("Email or password is incorrect");
  });
}); 