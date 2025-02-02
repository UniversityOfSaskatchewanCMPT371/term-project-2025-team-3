import { logger as reactLogger, consoleTransport } from 'react-native-logs';
import config from './config';
import { format } from 'date-fns';

const logLevels = {
  error: 0,
  warning: 1,
  info: 2,
  http: 3,
  debug: 4,
} 


const logger = reactLogger.createLogger({
  levels: logLevels,
  severity: config.logLevel,
  transport: consoleTransport,
  transportOptions: {
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'cyan',
      http: 'green',
      debug: 'magenta',
    },
  },
  async: true,
  dateFormat: ((date: Date) => format(date, 'yyyy-MM-dd HH:mm:ss ')),
  printLevel: true,
  printDate: true,
  fixedExtLvlLength: false,
  enabled: true,
});

export default logger;
