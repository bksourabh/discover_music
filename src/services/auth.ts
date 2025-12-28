import {GoogleSignin, statusCodes} from '@react-native-community/google-signin';
import {LoginManager, AccessToken, LoginResult} from 'react-native-fbsdk-next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email?: string;
  provider: 'google' | 'facebook' | 'apple';
  photo?: string;
}

const USER_STORAGE_KEY = '@user';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // Replace with your Google OAuth client ID
});

export const initAuth = async (): Promise<void> => {
  // Check if user is already logged in
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
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    if (userInfo.data?.user) {
      const user: User = {
        id: userInfo.data.user.id,
        name: userInfo.data.user.name || '',
        email: userInfo.data.user.email,
        provider: 'google',
        photo: userInfo.data.user.photo || undefined,
      };
      
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('User cancelled Google Sign-In');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Google Sign-In already in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('Google Play Services not available');
    } else {
      console.error('Google Sign-In error:', error);
    }
    return null;
  }
};

export const signInWithFacebook = async (): Promise<User | null> => {
  try {
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    
    if (result.isCancelled) {
      console.log('User cancelled Facebook login');
      return null;
    }
    
    const data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      return null;
    }
    
    // Fetch user info from Facebook Graph API
    const response = await fetch(
      `https://graph.facebook.com/me?access_token=${data.accessToken}&fields=id,name,email,picture`
    );
    const userData = await response.json();
    
    const user: User = {
      id: userData.id,
      name: userData.name || '',
      email: userData.email,
      provider: 'facebook',
      photo: userData.picture?.data?.url,
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
    // Apple Sign-In implementation
    // Note: You'll need to install @invertase/react-native-apple-authentication
    // and configure it properly
    
    // For now, this is a placeholder
    // In production, implement Apple Sign-In using:
    // import appleAuth from '@invertase/react-native-apple-authentication';
    
    console.log('Apple Sign-In not yet implemented');
    return null;
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
    await GoogleSignin.signOut();
    await LoginManager.logOut();
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

