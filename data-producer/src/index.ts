import "dotenv/config";
import { initializeHistoricalEvents } from "./initialization/historicalData.js";
import { logger } from "./logger.js";
import { createServer } from "./server.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const server = createServer();

// Pre-populate historical events before starting server
const serverStartTime = Date.now();
await initializeHistoricalEvents(serverStartTime);

server.listen(PORT, () => {
  logger.info(
    { port: PORT },
    `data-producer listening on http://localhost:${PORT}`
  );
});
