// functions/src/pulse.js
/* SETUP: run the following before deploying
    firebase init functions  (select existing project)
    cd functions && npm install
    firebase deploy --only functions
*/

const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// Helper: priority recalculation
function getEffectivePriority(deadlineDate, type, missedCount) {
  const hoursLeft = (deadlineDate.getTime() - Date.now()) / 36e5;
  if (missedCount >= 2) return 'critical';
  if (hoursLeft < 0) return 'critical';
  if (hoursLeft < 24) return 'high';
  if (type === 'assignment' || hoursLeft < 72) return 'high';
  if (type === 'hackathon' || hoursLeft < 168) return 'medium';
  return 'low';
}

// Helper: notification messages
function getNotificationMessage(task, scenario) {
  const map = {
    reminder_1hr: {
      title: 'Heads up — 1 hour left',
      body: `"${task.title}" is due soon. A focused hour now closes it out.`,
    },
    at_deadline: {
      title: 'Deadline reached',
      body: `"${task.title}" — submit what you have. Done beats perfect.`,
    },
    missed: {
      title: 'Missed task flagged',
      body: `"${task.title}" moved to high priority. Let's recover today.`,
    },
    streak: {
      title: 'You are on a roll',
      body: 'Tasks cleared. Your consistency is your advantage.',
    },
  };
  return map[scenario];
}

exports.escalateMissedTasks = onSchedule("every 1 hours", async (event) => {
  const now = admin.firestore.Timestamp.now();
  const snapshot = await db.collection("tasks")
    .where("status", "==", "pending")
    .where("deadline", "<", now)
    .get();

  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const newMissedCount = (data.missedCount || 0) + 1;
    const newPriority = getEffectivePriority(data.deadline.toDate(), data.type, newMissedCount);
    
    batch.update(doc.ref, {
      status: 'missed',
      missedCount: newMissedCount,
      priority: newPriority,
      updatedAt: now
    });
    
    // Could send missed notification here iteratively
  });

  await batch.commit();
});

exports.sendScheduledReminders = onSchedule("every 15 minutes", async (event) => {
  const now = Date.now();
  const lowerBound = admin.firestore.Timestamp.fromMillis(now - 15 * 60 * 1000);
  const upperBound = admin.firestore.Timestamp.fromMillis(now + 15 * 60 * 1000);

  const snapshot = await db.collection("tasks")
    .where("status", "==", "pending")
    .where("reminderAt", ">=", lowerBound)
    .where("reminderAt", "<=", upperBound)
    .get();

  if (snapshot.empty) return;

  const batch = db.batch();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.reminderSent) continue;

    const userDoc = await db.collection("users").doc(data.userId).get();
    if (userDoc.exists && userDoc.data().fcmTokens) {
      const tokens = userDoc.data().fcmTokens;
      const messageObj = getNotificationMessage(data, 'reminder_1hr');
      
      try {
        await messaging.sendEachForMulticast({
          tokens: tokens,
          notification: messageObj,
        });
      } catch (err) {
        console.error("FCM Send error:", err);
      }
    }

    batch.update(doc.ref, { reminderSent: true, updatedAt: admin.firestore.Timestamp.now() });
  }

  await batch.commit();
});

exports.onTaskDeadlineReached = onSchedule("every 5 minutes", async (event) => {
  const nowMs = Date.now();
  const lowerBound = admin.firestore.Timestamp.fromMillis(nowMs - 5 * 60 * 1000);
  const upperBound = admin.firestore.Timestamp.fromMillis(nowMs + 5 * 60 * 1000);

  const snapshot = await db.collection("tasks")
    .where("status", "==", "pending")
    .where("deadline", ">=", lowerBound)
    .where("deadline", "<=", upperBound)
    .get();

  if (snapshot.empty) return;

  const batch = db.batch();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.deadlineSent) continue;

    const userDoc = await db.collection("users").doc(data.userId).get();
    if (userDoc.exists && userDoc.data().fcmTokens) {
      const tokens = userDoc.data().fcmTokens;
      const messageObj = getNotificationMessage(data, 'at_deadline');
      
      try {
        await messaging.sendEachForMulticast({
          tokens: tokens,
          notification: messageObj,
        });
      } catch (err) {
        console.error("FCM Send error:", err);
      }
    }

    batch.update(doc.ref, { deadlineSent: true, updatedAt: admin.firestore.Timestamp.now() });
  }

  await batch.commit();
});
