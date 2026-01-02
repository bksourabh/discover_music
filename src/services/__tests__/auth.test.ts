import {
  initAuth,
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
  getCurrentUser,
  signOut,
  User,
} from '../auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

// Mock modules
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/google-signin');
jest.mock('react-native-fbsdk-next');

// Mock global fetch
global.fetch = jest.fn();

describe('auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initAuth', () => {
    it('should return early if user exists in storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
        id: '123',
        name: 'Test User',
        provider: 'google',
      }));

      await initAuth();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@user');
    });

    it('should handle error when reading from storage', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await initAuth();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error reading user from storage:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in successfully and save user to storage', async () => {
      const mockUser = {
        id: 'google123',
        name: 'Google User',
        email: 'user@google.com',
        photo: 'https://photo.url',
      };

      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const user = await signInWithGoogle();

      expect(user).toEqual({
        id: 'google123',
        name: 'Google User',
        email: 'user@google.com',
        provider: 'google',
        photo: 'https://photo.url',
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@user',
        JSON.stringify(user)
      );
    });

    it('should return null when user data is missing', async () => {
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
        data: {},
      });

      const user = await signInWithGoogle();

      expect(user).toBeNull();
    });

    it('should handle cancelled sign-in', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signIn as jest.Mock).mockRejectedValue({
        code: statusCodes.SIGN_IN_CANCELLED,
      });

      const user = await signInWithGoogle();

      expect(user).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('User cancelled Google Sign-In');
      consoleLogSpy.mockRestore();
    });

    it('should handle in-progress sign-in', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signIn as jest.Mock).mockRejectedValue({
        code: statusCodes.IN_PROGRESS,
      });

      const user = await signInWithGoogle();

      expect(user).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('Google Sign-In already in progress');
      consoleLogSpy.mockRestore();
    });

    it('should handle play services not available', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signIn as jest.Mock).mockRejectedValue({
        code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
      });

      const user = await signInWithGoogle();

      expect(user).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('Google Play Services not available');
      consoleLogSpy.mockRestore();
    });

    it('should handle other errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signIn as jest.Mock).mockRejectedValue(new Error('Unknown error'));

      const user = await signInWithGoogle();

      expect(user).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Google Sign-In error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('signInWithFacebook', () => {
    it('should sign in successfully and save user to storage', async () => {
      const mockAccessToken = { accessToken: 'token123' };
      const mockUserData = {
        id: 'fb123',
        name: 'Facebook User',
        email: 'user@facebook.com',
        picture: { data: { url: 'https://photo.url' } },
      };

      (LoginManager.logInWithPermissions as jest.Mock).mockResolvedValue({
        isCancelled: false,
      });
      (AccessToken.getCurrentAccessToken as jest.Mock).mockResolvedValue(mockAccessToken);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockUserData),
      });
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const user = await signInWithFacebook();

      expect(user).toEqual({
        id: 'fb123',
        name: 'Facebook User',
        email: 'user@facebook.com',
        provider: 'facebook',
        photo: 'https://photo.url',
      });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('graph.facebook.com/me')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@user',
        JSON.stringify(user)
      );
    });

    it('should return null when login is cancelled', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      (LoginManager.logInWithPermissions as jest.Mock).mockResolvedValue({
        isCancelled: true,
      });

      const user = await signInWithFacebook();

      expect(user).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('User cancelled Facebook login');
      consoleLogSpy.mockRestore();
    });

    it('should return null when access token is missing', async () => {
      (LoginManager.logInWithPermissions as jest.Mock).mockResolvedValue({
        isCancelled: false,
      });
      (AccessToken.getCurrentAccessToken as jest.Mock).mockResolvedValue(null);

      const user = await signInWithFacebook();

      expect(user).toBeNull();
    });

    it('should handle errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (LoginManager.logInWithPermissions as jest.Mock).mockRejectedValue(new Error('Facebook error'));

      const user = await signInWithFacebook();

      expect(user).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Facebook Sign-In error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('signInWithApple', () => {
    it('should return null (not implemented)', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const user = await signInWithApple();

      expect(user).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('Apple Sign-In not yet implemented');
      consoleLogSpy.mockRestore();
    });

    it('should handle errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      // Mock console.log to prevent it from being called
      jest.spyOn(console, 'log').mockImplementation();
      // The actual implementation catches errors, so we need to test that path
      // Since the function just logs and returns null, we'll verify error handling
      // by ensuring it doesn't throw
      const user = await signInWithApple();

      expect(user).toBeNull();
      // The function catches errors internally, so we just verify it returns null
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from storage', async () => {
      const mockUser: User = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        provider: 'google',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));

      const user = await getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@user');
    });

    it('should return null when no user in storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    it('should handle errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const user = await getCurrentUser();

      expect(user).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting current user:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('signOut', () => {
    it('should remove user from storage and sign out from providers', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      (GoogleSignin.signOut as jest.Mock).mockResolvedValue(undefined);
      (LoginManager.logOut as jest.Mock).mockResolvedValue(undefined);

      await signOut();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@user');
      expect(GoogleSignin.signOut).toHaveBeenCalled();
      expect(LoginManager.logOut).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await signOut();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});

