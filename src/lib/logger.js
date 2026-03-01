/**
 * Centralized Logger for The Oscars 2026
 * - Prevents PII leaks in production logs.
 * - Suppresses non-critical logs in production.
 * - Can be expanded to send logs to Sentry/LogRocket.
 */

const isProd = import.meta.env.PROD;

export const logger = {
    info: (message, data = null) => {
        if (!isProd) {
            console.log(`[INFO] ${message}`, data || "");
        }
    },

    warn: (message, data = null) => {
        if (!isProd) {
            console.warn(`[WARN] ${message}`, data || "");
        }
    },

    error: (message, error = null) => {
        // Errors should always be logged for debugging, but formatted cleanly
        console.error(`[ERROR] ${message}`, error ? error.message || error : "");

        // FUTURE: If Sentry is installed
        // if (isProd && window.Sentry) {
        //     window.Sentry.captureException(error);
        // }
    }
};
