type LogContext = Record<string, unknown>;

function scrubSensitive(data: LogContext): LogContext {
  const scrubbed = { ...data };
  const sensitiveKeys = ['pin', 'password', 'secret', 'token', 'cookie', 'hash'];
  
  for (const key of Object.keys(scrubbed)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      scrubbed[key] = '[REDACTED]';
    } else if (typeof scrubbed[key] === 'object' && scrubbed[key] !== null) {
      // Very basic shallow scrubbing for objects
      scrubbed[key] = scrubSensitive(scrubbed[key] as LogContext);
    }
  }
  
  return scrubbed;
}

function formatMessage(level: 'INFO' | 'WARN' | 'ERROR', message: string, context?: LogContext, error?: unknown) {
  const timestamp = new Date().toISOString();
  let logOutput = `[${timestamp}] ${level}: ${message}`;
  
  if (context) {
    const scrubbedContext = scrubSensitive(context);
    logOutput += ` | Context: ${JSON.stringify(scrubbedContext)}`;
  }
  
  if (error) {
    const errorDetails = error instanceof Error ? error.stack : String(error);
    logOutput += ` | Error: ${errorDetails}`;
  }
  
  return logOutput;
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.log(formatMessage('INFO', message, context));
  },
  
  warn(message: string, context?: LogContext, error?: unknown) {
    console.warn(formatMessage('WARN', message, context, error));
  },
  
  error(message: string, context?: LogContext, error?: unknown) {
    console.error(formatMessage('ERROR', message, context, error));
  }
};
