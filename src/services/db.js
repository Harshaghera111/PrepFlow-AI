// Firestore database helpers for per-user, per-day progress tracking
// Data is stored at: users/{userId}/days/{YYYY-MM-DD}
//
// Schema for each day's document:
// {
//   solved: boolean,       — whether the user marked today's question solved
//   hintsUsed: number,     — how many times hint was shown (0 or 1)
//   streak: number,        — current streak count
//   lastUpdated: timestamp — Firestore server timestamp
// }

import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns today's date as a string like "2026-03-20" (used as Firestore doc ID)
 */
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Returns the Firestore document reference for a user's day
 * Path: users/{userId}/days/{YYYY-MM-DD}
 */
function getDayRef(userId) {
  const today = getTodayKey();
  return doc(db, "users", userId, "days", today);
}

/**
 * Returns the top-level user document reference
 * Path: users/{userId}
 */
function getUserRef(userId) {
  return doc(db, "users", userId);
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Load today's progress for a user.
 * Returns: { solved, hintsUsed, streak } or default values if no record yet.
 */
export async function getDayProgress(userId) {
  try {
    const daySnap = await getDoc(getDayRef(userId));
    const userSnap = await getDoc(getUserRef(userId));

    const dayData = daySnap.exists() ? daySnap.data() : {};
    const userData = userSnap.exists() ? userSnap.data() : {};

    return {
      solved: dayData.solved ?? false,
      hintsUsed: dayData.hintsUsed ?? 0,
      streak: userData.streak ?? 0,
    };
  } catch (err) {
    console.error("Firestore read error:", err);
    // Return safe defaults so the UI doesn't break
    return { solved: false, hintsUsed: 0, streak: 0 };
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Mark today's question as solved and update the streak.
 * Increments streak only once per day.
 */
export async function markSolved(userId, currentStreak) {
  try {
    const dayRef = getDayRef(userId);
    const daySnap = await getDoc(dayRef);

    // Write or update today's day doc
    if (daySnap.exists()) {
      await updateDoc(dayRef, { solved: true, lastUpdated: serverTimestamp() });
    } else {
      // First activity today — also increment streak
      await setDoc(dayRef, {
        solved: true,
        hintsUsed: 0,
        lastUpdated: serverTimestamp(),
      });
      // Increment streak on the top-level user doc
      await setDoc(
        getUserRef(userId),
        { streak: increment(1) },
        { merge: true }
      );
    }
  } catch (err) {
    console.error("Firestore write error (markSolved):", err);
  }
}

/**
 * Unmark today's question as solved (toggle back).
 * Does NOT decrement the streak.
 */
export async function unmarkSolved(userId) {
  try {
    const dayRef = getDayRef(userId);
    const daySnap = await getDoc(dayRef);
    if (daySnap.exists()) {
      await updateDoc(dayRef, { solved: false, lastUpdated: serverTimestamp() });
    }
  } catch (err) {
    console.error("Firestore write error (unmarkSolved):", err);
  }
}

/**
 * Record that the user viewed the hint today.
 */
export async function recordHintUsed(userId) {
  try {
    const dayRef = getDayRef(userId);
    const daySnap = await getDoc(dayRef);

    if (daySnap.exists()) {
      await updateDoc(dayRef, { hintsUsed: 1, lastUpdated: serverTimestamp() });
    } else {
      await setDoc(dayRef, {
        solved: false,
        hintsUsed: 1,
        lastUpdated: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("Firestore write error (recordHintUsed):", err);
  }
}

// ─── Progress History ─────────────────────────────────────────────────────────

/**
 * Get all day documents for a user (for heatmap + history).
 * Returns array of { date: "YYYY-MM-DD", solved, hintsUsed, topic, question }
 */
export async function getAllDays(userId) {
  try {
    const { collection, getDocs } = await import("firebase/firestore");
    const daysRef = collection(db, "users", userId, "days");
    const snap = await getDocs(daysRef);
    return snap.docs.map((d) => ({ date: d.id, ...d.data() }));
  } catch (err) {
    console.error("getAllDays error:", err);
    return [];
  }
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

function getBookmarkRef(userId, bookmarkId) {
  return doc(db, "users", userId, "bookmarks", bookmarkId);
}

/**
 * Add a bookmark for a question.
 * @param {string} userId
 * @param {{ question, hint, difficulty, topic, company }} data
 */
export async function addBookmark(userId, data) {
  try {
    const id = `bm_${Date.now()}`;
    await setDoc(getBookmarkRef(userId, id), {
      ...data,
      savedAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    console.error("addBookmark error:", err);
    return null;
  }
}

/**
 * Remove a bookmark by its document ID.
 */
export async function removeBookmark(userId, bookmarkId) {
  try {
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(getBookmarkRef(userId, bookmarkId));
  } catch (err) {
    console.error("removeBookmark error:", err);
  }
}

/**
 * Get all bookmarks for a user.
 * Returns array of { id, question, hint, difficulty, topic, company, savedAt }
 */
export async function getBookmarks(userId) {
  try {
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const ref = collection(db, "users", userId, "bookmarks");
    const q = query(ref, orderBy("savedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("getBookmarks error:", err);
    return [];
  }
}

