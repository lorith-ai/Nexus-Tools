/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const logger = require("firebase-functions/logger");
const fetch = require("node-fetch");

initializeApp();

// Retrieve API Key from secret or environment variable
// Preferred: define secret via `firebase functions:secrets:set GEMINI_API_KEY`
// Fallback: process.env.GEMINI_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.generateContent = onCall({ cors: true, secrets: ["GEMINI_API_KEY"] }, async (request) => {
    // 1. Auth Verification
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated to use this feature.");
    }

    // 2. Input Validation (Basic)
    const { prompt } = request.data;
    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
        throw new HttpsError("invalid-argument", "Prompt is required and must be under 2000 characters.");
    }

    // 3. User Rate Limiting (10 requests per hour)
    const uid = request.auth.uid;
    const db = getFirestore();
    const rateLimitRef = db.collection('rate_limits').doc(uid);

    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 Hour

    try {
        await db.runTransaction(async (t) => {
            const doc = await t.get(rateLimitRef);
            const data = doc.data() || { count: 0, resetTime: now + windowMs };

            if (now > data.resetTime) {
                // Reset window
                t.set(rateLimitRef, { count: 1, resetTime: now + windowMs });
            } else if (data.count >= 10) {
                throw new HttpsError("resource-exhausted", "Hourly quota exceeded. Please try again later.");
            } else {
                // Increment
                t.update(rateLimitRef, { count: FieldValue.increment(1) });
            }
        });
    } catch (e) {
        if (e.code === 'resource-exhausted') throw e;
        logger.error("Rate limit check failed", e);
        // Fail open or closed? Closed for security.
        throw new HttpsError("internal", "Rate limit verification failed.");
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
        if (!apiKey) {
            logger.error("Missing Gemini API Key configuration.");
            throw new HttpsError("internal", "Service configuration error.");
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error("Gemini API Error", { status: response.status, body: errorText });
            throw new HttpsError("unavailable", "AI service temporarily unavailable.");
        }

        const data = await response.json();
        return data;

    } catch (error) {
        logger.error("Proxy execution error", error);
        if (error instanceof HttpsError) throw error;
        throw new HttpsError("internal", "Analysis failed.");
    }
});
