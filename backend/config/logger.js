import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';


function formatMessage(message) {
    if (message === undefined) {
        return 'undefined'; 
    }
    if (message === null) {
        return 'null'; 
    }
    if (typeof message === 'string') {
        return message; 
    }
    return '\n' + JSON.stringify(message, null, 2);
}

const devFormat = combine(
  colorize(),
  timestamp(),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${formatMessage(message)} ${stack ?  "\nStack: \n " + stack : ""}`; 
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
  ],
});

if (isProduction && proces.env.PROD_TYPE !== 'docker') {//cause errors saved in files will be saved to container's file system if using docker
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    })
  );
}


export default logger;
