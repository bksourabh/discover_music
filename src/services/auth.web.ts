/**
 * Web-compatible auth service
 * Stubs for native auth modules that don't work on web
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email?: string;
  provider: 'google' | 'facebook' | 'apple';
  photo?: string;
}

const USER_STORAGE_KEY = '@user';

// Stub for Google Sign-In on web
const GoogleSignin = {
  configure: () => {},
  hasPlayServices: async () => true,
  signIn: async () => ({
    data: {
      user: {
        id: 'demo-google-user',
        name: 'Demo Google User',
        email: 'demo@google.com',
      },
    },
  }),
  signOut: async () => {},
};

// Stub for Facebook Login on web
const LoginManager = {
  logInWithPermissions: async () => ({
    isCancelled: false,
  }),
  logOut: async () => {},
};

const AccessToken = {
  getCurrentAccessToken: async () => ({
    accessToken: 'demo-token',
  }),
};

export const initAuth = async (): Promise<void> => {
  try {
    const userString = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (userString) {
      return;
    }
  } catch (error) {
    console.error('Error reading user from storage:', error);
  }
};

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    // On web, return a demo user for testing
    const user: User = {
      id: 'demo-google-user-' + Date.now(),
      name: 'Demo Google User',
      email: 'demo@google.com',
      provider: 'google',
    };
    
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Google Sign-In error:', error);
    return null;
  }
};

export const signInWithFacebook = async (): Promise<User | null> => {
  try {
    // On web, return a demo user for testing
    const user: User = {
      id: 'demo-facebook-user-' + Date.now(),
      name: 'Demo Facebook User',
      email: 'demo@facebook.com',
      provider: 'facebook',
    };
    
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Facebook Sign-In error:', error);
    return null;
  }
};

export const signInWithApple = async (): Promise<User | null> => {
  try {
    // On web, return a demo user for testing
    const user: User = {
      id: 'demo-apple-user-' + Date.now(),
      name: 'Demo Apple User',
      email: 'demo@apple.com',
      provider: 'apple',
    };
    
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Apple Sign-In error:', error);
    return null;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userString = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

