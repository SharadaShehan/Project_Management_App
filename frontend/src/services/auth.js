// AWS Amplify Authentication Service
import { Auth } from 'aws-amplify';

/**
 * Sign up a new user
 */
export const signUp = async (username, email, password, attributes = {}) => {
  try {
    const { user } = await Auth.signUp({
      username,
      password,
      attributes: {
        email,
        ...attributes
      },
      autoSignIn: {
        enabled: true
      }
    });
    
    return {
      success: true,
      user,
      message: 'Sign up successful. Please check your email for verification code.'
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Confirm sign up with verification code
 */
export const confirmSignUp = async (username, code) => {
  try {
    await Auth.confirmSignUp(username, code);
    return {
      success: true,
      message: 'Account verified successfully'
    };
  } catch (error) {
    console.error('Error confirming sign up:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Resend verification code
 */
export const resendConfirmationCode = async (username) => {
  try {
    await Auth.resendSignUp(username);
    return {
      success: true,
      message: 'Verification code resent'
    };
  } catch (error) {
    console.error('Error resending code:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign in user
 */
export const signIn = async (username, password) => {
  try {
    const user = await Auth.signIn(username, password);
    return {
      success: true,
      user,
      message: 'Sign in successful'
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign out user
 */
export const signOut = async () => {
  try {
    await Auth.signOut();
    return {
      success: true,
      message: 'Sign out successful'
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('No authenticated user:', error);
    return {
      success: false,
      error: 'Not authenticated'
    };
  }
};

/**
 * Get current user session (includes JWT tokens)
 */
export const getCurrentSession = async () => {
  try {
    const session = await Auth.currentSession();
    return {
      success: true,
      session,
      accessToken: session.getAccessToken().getJwtToken(),
      idToken: session.getIdToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken()
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Forgot password - send reset code
 */
export const forgotPassword = async (username) => {
  try {
    await Auth.forgotPassword(username);
    return {
      success: true,
      message: 'Password reset code sent to your email'
    };
  } catch (error) {
    console.error('Error sending reset code:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Reset password with code
 */
export const forgotPasswordSubmit = async (username, code, newPassword) => {
  try {
    await Auth.forgotPasswordSubmit(username, code, newPassword);
    return {
      success: true,
      message: 'Password reset successful'
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Change password for authenticated user
 */
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    await Auth.changePassword(user, oldPassword, newPassword);
    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user attributes
 */
export const updateUserAttributes = async (attributes) => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    await Auth.updateUserAttributes(user, attributes);
    return {
      success: true,
      message: 'User attributes updated successfully'
    };
  } catch (error) {
    console.error('Error updating attributes:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user attributes
 */
export const getUserAttributes = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const attributes = await Auth.userAttributes(user);
    return {
      success: true,
      attributes
    };
  } catch (error) {
    console.error('Error getting attributes:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify current user attribute with code
 */
export const verifyAttribute = async (attribute, code) => {
  try {
    await Auth.verifyCurrentUserAttributeSubmit(attribute, code);
    return {
      success: true,
      message: `${attribute} verified successfully`
    };
  } catch (error) {
    console.error('Error verifying attribute:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete user account
 */
export const deleteUser = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    await user.deleteUser();
    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  signUp,
  confirmSignUp,
  resendConfirmationCode,
  signIn,
  signOut,
  getCurrentUser,
  getCurrentSession,
  forgotPassword,
  forgotPasswordSubmit,
  changePassword,
  updateUserAttributes,
  getUserAttributes,
  verifyAttribute,
  deleteUser
};
