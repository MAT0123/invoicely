
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";



const cronSecret = defineSecret("CRON_API_KEY");
// Cron job function that runs daily at 9 AM
const check = async () => {
    console.log("Daily invoice check started at:", new Date());

    try {
        const response = await fetch('http://invoicely.matthewautjoa.tech/api/cron-jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cronSecret.value()}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API call failed with status: ${response.status}, response: ${errorText}`);
        }

        const result = await response.json();
        console.log("API call successful:", result);

    } catch (error) {
        console.error("Error calling cron API:", error);
        throw error;
    }
}
exports.manualDailyInvoiceCheck = onRequest({ secrets: [cronSecret] }, async (req, res) => {
    try {
        const out = await check();
        res.status(200).send(out);
    } catch (e: any) {
        res.status(500).send(e?.message ?? String(e));
    }
});
exports.dailyInvoiceCheck = onSchedule(
    {
        schedule: "0 9 * * *", // Runs every day at 9:00 AM UTC
        timeZone: "America/New_York",
        secrets: [cronSecret] // Add this line to access the secret
    },

    async (event) => {
        return await check()
    });

