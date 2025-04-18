import { Connection } from 'mysql2/promise';
import crypto from 'crypto';

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface LoginResponse {
  success: boolean;
  user?: Omit<User, 'password'>;
  error?: string;
}

export class UserService {
  constructor(private db: Connection) {}

  // 用户登录
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const [rows] = await this.db.execute(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, this.hashPassword(password)]
      );
      
      if (Array.isArray(rows) && rows.length > 0) {
        const user = rows[0] as User;
        // 返回用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = user;
        
        return {
          success: true,
          user: userWithoutPassword
        };
      }
      
      return {
        success: false,
        error: '用户名或密码错误'
      };
    } catch (err) {
      console.error('登录失败:', err);
      return {
        success: false,
        error: '登录失败，请稍后重试'
      };
    }
  }

  // 验证用户登录
  async validateUser(username: string, password: string): Promise<boolean> {
    try {
      const [rows] = await this.db.execute(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, this.hashPassword(password)]
      );
      
      return Array.isArray(rows) && rows.length > 0;
    } catch (err) {
      console.error('验证用户失败:', err);
      return false;
    }
  }

  // 获取用户信息
  async getUserInfo(userId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const [rows] = await this.db.execute(
        'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );
      
      if (Array.isArray(rows) && rows.length > 0) {
        return rows[0] as Omit<User, 'password'>;
      }
      return null;
    } catch (err) {
      console.error('获取用户信息失败:', err);
      return null;
    }
  }

  // 密码加密
  private hashPassword(password: string): string {
    return crypto.createHash('md5').update(password).digest('hex');
  }
} 