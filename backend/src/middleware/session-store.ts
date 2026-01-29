import session from 'express-session';
import db from '../db/database.js';

export class SQLiteStore extends session.Store {
  private getStmt = db.prepare('SELECT data, expires FROM sessions WHERE sid = ?');
  private setStmt = db.prepare('INSERT OR REPLACE INTO sessions (sid, data, expires) VALUES (?, ?, ?)');
  private destroyStmt = db.prepare('DELETE FROM sessions WHERE sid = ?');
  private cleanupStmt = db.prepare('DELETE FROM sessions WHERE expires < ?');

  constructor() {
    super();
    // Cleanup expired sessions every 15 minutes
    setInterval(() => this.cleanup(), 15 * 60 * 1000);
    this.cleanup();
  }

  get(sid: string, cb: (err: any, session?: session.SessionData | null) => void) {
    try {
      const row = this.getStmt.get(sid) as { data: string; expires: number } | undefined;
      if (!row || row.expires < Date.now()) {
        return cb(null, null);
      }
      cb(null, JSON.parse(row.data));
    } catch (err) {
      cb(err);
    }
  }

  set(sid: string, sessionData: session.SessionData, cb?: (err?: any) => void) {
    try {
      const expires = sessionData.cookie?.expires
        ? new Date(sessionData.cookie.expires).getTime()
        : Date.now() + 86400000; // 24h default
      this.setStmt.run(sid, JSON.stringify(sessionData), expires);
      cb?.();
    } catch (err) {
      cb?.(err);
    }
  }

  destroy(sid: string, cb?: (err?: any) => void) {
    try {
      this.destroyStmt.run(sid);
      cb?.();
    } catch (err) {
      cb?.(err);
    }
  }

  private cleanup() {
    this.cleanupStmt.run(Date.now());
  }
}
