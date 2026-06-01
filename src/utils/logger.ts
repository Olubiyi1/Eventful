import winston from "winston";


winston.addColors({
  info: "blue",
  warn: "yellow",
  error: "red",
  debug: "gray",
});

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.printf((info) => {
    const label = info["label"] || "EVENTFUL";
    return `${info.timestamp} [${info.level.toUpperCase()}] [${label}] ${info.message}`;
  })
);

export const logger = winston.createLogger({
  level: "info",

  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],

  exitOnError: false,
});

// Graceful shutdown
export const exitAfterFlush = async () => {
  logger.close();

  await new Promise<void>((resolve) =>
    setTimeout(resolve, 2000)
  );
};