import { database } from "@/config/db.config.js";

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password_hash: string;
}

class UserRepository {
  /**
   * Create a new user
   */
  async create(userData: CreateUserData): Promise<User> {
    const query = `INSERT INTO users (username, email, password_hash) values ($1, $2, $3) RETURNING *`;

    const result = await database.query<User>(query, [
      userData.username,
      userData.email,
      userData.password_hash,
    ]);

    return result.rows[0]!;
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    const query = `SELECT * FROM users WHERE id = $1`;

    const result = await database.query<User>(query, [id]);

    return result.rows[0] || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM users WHERE email = $1`;

    const result = await database.query<User>(query, [email]);

    return result.rows[0] || null;
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const query = `SELECT * FROM users WHERE username = $1`;

    const result = await database.query<User>(query, [username]);

    return result.rows[0] || null;
  }

  /**
   * Check if email exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(SELECT 1 FROM users WHERE username = $1) as exists
    `;

    const result = await database.query<{ exists: boolean }>(query, [username]);
    return result.rows[0]!.exists;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists
    `;

    const result = await database.query<{ exists: boolean }>(query, [email]);
    return result.rows[0]!.exists;
  }
}

export const userRepository = new UserRepository();
