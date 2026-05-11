import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

export const onFalseReportCreated = onDocumentCreated(
  "reports/{reportId}",
  async (event) => {
    const snap = event.data;

    if (!snap) {
      console.log("No report snapshot found.");
      return;
    }

    const report = snap.data();

    const senderId = report.senderId;
    const reportedBy = report.reportedBy;
    const alertId = report.alertId;

    if (!senderId || senderId === "anonymous" || senderId === "unknown") {
      console.log("No valid senderId found. Skipping trust score update.");
      return;
    }

    if (!reportedBy || reportedBy === "anonymous") {
      console.log("No valid reporter found. Skipping trust score update.");
      return;
    }

    if (senderId === reportedBy) {
      console.log("Reporter and sender are same user. Skipping trust score update.");
      return;
    }

    const db = admin.firestore();

    const senderRef = db.collection("users").doc(senderId);
    const reportRef = snap.ref;

    await db.runTransaction(async (transaction) => {
      const reportSnap = await transaction.get(reportRef);

      if (!reportSnap.exists) {
        console.log("Report no longer exists.");
        return;
      }

      const freshReport = reportSnap.data();

      if (freshReport?.processed === true) {
        console.log("Report already processed. Skipping duplicate update.");
        return;
      }

      transaction.set(
        senderRef,
        {
          trustScore: admin.firestore.FieldValue.increment(-1),
          strikeCount: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      transaction.update(reportRef, {
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (alertId) {
        const alertRef = db.collection("alerts").doc(alertId);

        transaction.set(
          alertRef,
          {
            falseReportCount: admin.firestore.FieldValue.increment(1),
            status: "false_reported",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    });

    console.log(`Trust score updated for sender: ${senderId}`);
  }
);