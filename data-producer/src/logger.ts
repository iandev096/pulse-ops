import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const logLevel = process.env.LOG_LEVEL || "info";

export const logger = pino({
  level: logLevel,
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }),
});
