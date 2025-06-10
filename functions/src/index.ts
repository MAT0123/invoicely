/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";

// Initialize Firebase Admin
admin.initializeApp();

// Cron job function that runs daily at 9 AM
export const dailyInvoiceCheck = onSchedule(
    {
        schedule: "0 9 * * *", // Runs every day at 9:00 AM UTC
        timeZone: "America/New_York"
    },
    async (event) => {
        console.log("Daily invoice check started at:", new Date());

        try {
            // Call your Next.js API route
            const response = await fetch('https://invoicely.matthewautjoa.tech/api/cron-jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${functions.config().cron?.secret}` // Your CRON_SECRET
                }
            });

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            console.log("API call successful:", result);

            // Do not return a value, just log
        } catch (error) {
            console.error("Error calling cron API:", error);
            throw error;
        }
    });

// Manual trigger function (for testing)
// export const manualInvoiceCheck = functions.https.onCall(async (data, context) => {
//     // Optional: Add authentication check
//     if (!context.auth) {
//         throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
//     }

//     console.log("Manual invoice check triggered by user:", context.auth.uid);

//     try {
//         // Same logic as daily check
//         const today = new Date();
//         let overdueCount = 0;

//         const usersSnapshot = await db.collection("users").get();

//         for (const userDoc of usersSnapshot.docs) {
//             const userId = userDoc.id;

//             const invoicesSnapshot = await db
//                 .collection("users")
//                 .doc(userId)
//                 .collection("invoices")
//                 .where("status", "!=", "paid")
//                 .get();

//             for (const invoiceDoc of invoicesSnapshot.docs) {
//                 const invoiceData = invoiceDoc.data();
//                 const dueDate = new Date(invoiceData.dueDate);

//                 if (dueDate < today && invoiceData.clientEmail) {
//                     console.log(`Manual check - Found overdue: ${invoiceData.invoiceNumber}`);
//                     overdueCount++;
//                 }
//             }
//         }

//         return { success: true, overdueCount, checkedAt: new Date() };

//     } catch (error) {
//         console.error("Error in manual invoice check:", error);
//         throw new functions.https.HttpsError("internal", "Failed to process invoices");
//     }
// });

// // HTTP endpoint version (if you prefer REST API)
// export const checkOverdueInvoicesHttp = functions.https.onRequest(async (req, res) => {
//     // Add CORS if needed
//     res.set("Access-Control-Allow-Origin", "*");
//     res.set("Access-Control-Allow-Methods", "GET, POST");
//     res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

//     if (req.method === "OPTIONS") {
//         res.status(204).send("");
//         return;
//     }

//     // Optional: Add authentication
//     const authHeader = req.headers.authorization;
//     if (!authHeader || authHeader !== `Bearer ${functions.config().cron?.secret}`) {
//         res.status(401).json({ error: "Unauthorized" });
//         return;
//     }

//     try {
//         const today = new Date();
//         let overdueInvoices: any[] = [];

//         const usersSnapshot = await db.collection("users").get();

//         for (const userDoc of usersSnapshot.docs) {
//             const userId = userDoc.id;

//             const invoicesSnapshot = await db
//                 .collection("users")
//                 .doc(userId)
//                 .collection("invoices")
//                 .get();

//             invoicesSnapshot.docs.forEach(invoiceDoc => {
//                 const invoiceData = invoiceDoc.data();
//                 const dueDate = new Date(invoiceData.dueDate);

//                 if (dueDate < today && invoiceData.status !== "paid" && invoiceData.clientEmail) {
//                     overdueInvoices.push({
//                         id: invoiceDoc.id,
//                         userId: userId,
//                         invoiceNumber: invoiceData.invoiceNumber,
//                         clientEmail: invoiceData.clientEmail,
//                         dueDate: invoiceData.dueDate,
//                         amount: invoiceData.total
//                     });
//                 }
//             });
//         }

//         res.json({
//             success: true,
//             timestamp: new Date(),
//             overdueCount: overdueInvoices.length,
//             overdueInvoices: overdueInvoices
//         });

//     } catch (error) {
//         console.error("Error checking overdue invoices:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });
