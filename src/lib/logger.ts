type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private log(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();

    if (typeof window === 'undefined') {
      // Server-side logging
      console[level](
        `[${timestamp}] ${level.toUpperCase()}: ${message}`,
        meta || ''
      );
    } else {
      // Client-side logging
      console[level](
        `[${timestamp}] ${level.toUpperCase()}: ${message}`,
        meta || ''
      );
    }
  }

  info(message: string, meta?: unknown) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: unknown) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: unknown) {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: unknown) {
    this.log('debug', message, meta);
  }
}

export const logger = new Logger();
