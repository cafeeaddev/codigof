/**
 * Sistema de logging estruturado para substituir console.error
 * Reduz poluição de logs e melhora debugging
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  data?: any;
}

export class Logger {
  private static instance: Logger;
  private context: string = '';

  constructor(context?: string) {
    this.context = context || '';
  }

  static create(context: string): Logger {
    return new Logger(context);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const prefix = this.context ? `[${this.context}]` : '';
    
    if (level === LogLevel.ERROR) {
      console.error(`${timestamp} ${prefix} ERROR: ${message}`, context?.data || '');
    } else if (level === LogLevel.WARN) {
      console.warn(`${timestamp} ${prefix} WARN: ${message}`, context?.data || '');
    } else if (level === LogLevel.INFO) {
      console.info(`${timestamp} ${prefix} INFO: ${message}`, context?.data || '');
    } else if (level === LogLevel.DEBUG && process.env.NODE_ENV === 'development') {
      console.log(`${timestamp} ${prefix} DEBUG: ${message}`, context?.data || '');
    }
  }

  error(message: string, context?: LogContext): void {
    this.formatMessage(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.formatMessage(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.formatMessage(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.formatMessage(LogLevel.DEBUG, message, context);
  }
}

// Instâncias globais para componentes principais
export const gameLogger = Logger.create('Game');
export const missionLogger = Logger.create('Mission');
export const authLogger = Logger.create('Auth');
export const adminLogger = Logger.create('Admin');
export const progressLogger = Logger.create('Progress');