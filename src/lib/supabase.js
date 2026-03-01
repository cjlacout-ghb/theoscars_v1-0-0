import { logger } from './logger';

const SUPABASE_URL = "https://lezdpqvgizwocanjeray.supabase.co";
const SUPABASE_KEY = "sb_publishable_U1MphUk0VKWQCLJFIJSeBg_L2h7F08X";

/**
 * Retrieves a value from Supabase storage by key.
 * @param {string} key - The key of the item to retrieve.
 * @returns {Promise<any|null>} - The parsed value or null if not found/error.
 */
export async function storageGet(key) {
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/oscars_storage?key=eq.${key}&select=value`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                },
            }
        );

        if (!res.ok) {
            logger.error(`storageGet failed for key "${key}":`, { status: res.status });
            return null;
        }

        const data = await res.json();
        return data.length > 0 ? JSON.parse(data[0].value) : null;
    } catch (err) {
        logger.error(`storageGet internal error for key "${key}":`, err);
        return null;
    }
}

/**
 * Sets a value in Supabase storage by key.
 * @param {string} key - The key of the item to set.
 * @param {any} val - The value to store (will be JSON stringified).
 */
export async function storageSet(key, val) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/oscars_storage`, {
            method: "POST",
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify({ key, value: JSON.stringify(val) }),
        });

        if (!res.ok) {
            const txt = await res.text();
            logger.error(`storageSet error for key "${key}":`, { status: res.status, text: txt });
        }
    } catch (err) {
        logger.error(`storageSet internal error for key "${key}":`, err);
    }
}
