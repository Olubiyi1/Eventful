import { logger } from "./logger";


type LogMeta = Record<string, unknown>;

interface LabelLogger {
  info: (msg: string, meta?: LogMeta) => void;
  error: (msg: string, meta?: LogMeta) => void;
  warn: (msg: string, meta?: LogMeta) => void;
  debug: (msg: string, meta?: LogMeta) => void;
}

class Labels {
  static createLabel(labelName: string): LabelLogger {
    return {
      info: (msg, meta) => logger.info(msg, { label: labelName, ...meta }),
      error: (msg, meta) => logger.error(msg, { label: labelName, ...meta }),
      warn: (msg, meta) => logger.warn(msg, { label: labelName, ...meta }),
      debug: (msg, meta) => logger.debug(msg, { label: labelName, ...meta }),
    };
  }
}

export default Labels;