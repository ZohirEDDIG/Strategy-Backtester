import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export const userRepository = {
  async findByEmail(email: string) {
    await connectToDatabase();
    return User.findOne({ email: email.toLowerCase().trim() });
  },

  async create(input: { email: string; passwordHash: string; name?: string }) {
    await connectToDatabase();
    return User.create({
      email: input.email.toLowerCase().trim(),
      passwordHash: input.passwordHash,
      name: input.name,
    });
  },
};
