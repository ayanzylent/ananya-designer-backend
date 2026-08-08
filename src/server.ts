// Server entry point

import { buildApp } from './app.js';
import {
  startExpireInventoryHoldsJob,
  stopExpireInventoryHoldsJob,
} from './jobs/expire-inventory-holds.js';

const STARTUP_DELAY_MS = 60_000;

async function main(): Promise<void> {
  let app;

  try {
    console.log(`⏳ Waiting ${STARTUP_DELAY_MS / 1000}s before starting server...`);
    await new Promise((resolve) => setTimeout(resolve, STARTUP_DELAY_MS));

    app = await buildApp();

    const port = app.config.PORT;
    const host = '0.0.0.0';

    const stopExpiryJob = startExpireInventoryHoldsJob(app.log);

    app.addHook('onClose', async () => {
      stopExpiryJob();
      stopExpireInventoryHoldsJob();
    });

    await app.listen({ port, host });
    app.log.info(`🚀server running at http://localhost:${port}`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }

}

main();
