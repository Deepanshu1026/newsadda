const cron = require("node-cron");


// Load environment variables manually if dotenv is not available, or pick from process.env
const syncInterval = process.env.SYNC_INTERVAL_MINUTES || "60";
const port = process.env.PORT || "3000";

console.log("====================================================");
console.log(`[Cron Daemon] Initializing background scheduler...`);
console.log(`[Cron Daemon] Configured interval: Every ${syncInterval} minute(s)`);
console.log(`[Cron Daemon] Target endpoint: http://localhost:${port}/api/sync`);
console.log("====================================================");

// Set up cron expression. For easy developer demonstration, if syncInterval is 60, we trigger it every hour.
// If the user wants a faster sync, they can customize this.
const cronExpression = `*/${syncInterval} * * * *`;

let isSyncing = false;

const triggerSync = async () => {
  if (isSyncing) {
    console.log("[Cron Daemon] A sync cycle is already active. Skipping trigger.");
    return;
  }

  isSyncing = true;
  console.log(`[Cron Daemon] [${new Date().toLocaleTimeString()}] Triggering scheduled AI sync pipeline...`);
  
  try {
    const response = await fetch(`http://localhost:${port}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[Cron Daemon] [Success] ${data.message}`);
    } else {
      const err = await response.json().catch(() => ({}));
      console.warn(`[Cron Daemon] [Warning] Sync endpoint returned status ${response.status}:`, err.error || "Unknown error");
    }
  } catch (error) {
    console.error(`[Cron Daemon] [Error] Failed to connect to Next.js API sync route:`, error.message);
    console.log("[Cron Daemon] (Note: This is expected if the Next.js dev server has not finished booting yet. Will retry next cycle.)");
  } finally {
    isSyncing = false;
  }
};

// Start the cron job scheduler
cron.schedule(cronExpression, triggerSync);

// Proactively run an initial sync after 15 seconds to populate news feed on initial boot
console.log("[Cron Daemon] Scheduling initial boot sync in 15 seconds...");
setTimeout(triggerSync, 15000);
