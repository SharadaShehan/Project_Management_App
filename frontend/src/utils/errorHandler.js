/**
 * Parse and extract user-friendly error message from GraphQL or network errors
 * @param {Error} err - The error object from catch block
 * @returns {string} - User-friendly error message
 */
export const parseErrorMessage = (err) => {
    let errorMessage = 'An unexpected error occurred';
    
    // Check if error is from GraphQL with structured error message
    if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const gqlError = err.graphQLErrors[0];
        if (gqlError.message) {
            try {
                // Try to parse if message is JSON string
                const parsed = JSON.parse(gqlError.message);
                errorMessage = parsed.message || gqlError.message;
            } catch {
                // If not JSON, use the message as is
                errorMessage = gqlError.message;
            }
        }
    } else if (err.networkError) {
        errorMessage = 'Network error. Please check your connection.';
    } else if (err.message) {
        errorMessage = err.message;
    }
    
    return errorMessage;
};
