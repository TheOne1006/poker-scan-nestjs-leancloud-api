/**
 * 操作、访问用户信息
 */
export interface RequestUser {
  id: string;

  username: string;

  token: string;

  email?: string;

  roles?: string[];

  ip?: string;
}
