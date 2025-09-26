import type { Exercise } from '../types';
import { EXERCISE_LIBRARY } from '../constants/exerciseLibrary';

/**
 * Fetches the exercise library.
 * NOTE: This implementation returns a static, local library to ensure functionality
 * in environments where external network requests to Google Sheets may be blocked or fail.
 * This prevents the application from breaking due to network-related issues.
 *
 * @returns A promise that resolves to the structured exercise library.
 */
export const fetchExerciseLibrary = async (): Promise<Record<string, Exercise>> => {
    // Return the local library as a resolved promise to mimic a successful async fetch.
    return Promise.resolve(EXERCISE_LIBRARY);
};
