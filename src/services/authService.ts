import bcrypt from 'bcryptjs';
import { userRepository } from '@/repositories/userRepository';
import { RegisterInput } from '@/validators/auth';
import { ConflictError } from '@/lib/api';

const SALT_ROUNDS = 10;

export const authService = {
  async register(input: RegisterInput): Promise<{ id: string; email: string }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new ConflictError('An account with this email already exists');

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      name: input.name || undefined,
    });

    return { id: String(user._id), email: user.email };
  },
};
