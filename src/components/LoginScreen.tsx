import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

// Use web-compatible auth for web, native for mobile
const isWeb = typeof window !== 'undefined' && !window.navigator.userAgent.includes('ReactNative');
const authModule = isWeb
  ? require('../services/auth.web')
  : require('../services/auth');
const {signInWithGoogle, signInWithFacebook, signInWithApple} = authModule;

// Import User type
interface User {
  id: string;
  name: string;
  email?: string;
  provider: 'google' | 'facebook' | 'apple';
  photo?: string;
}

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({onLoginSuccess}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      const user = await signInWithGoogle();
      if (user) {
        onLoginSuccess(user);
      } else {
        Alert.alert('Error', 'Failed to sign in with Google');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading('facebook');
    try {
      const user = await signInWithFacebook();
      if (user) {
        onLoginSuccess(user);
      } else {
        Alert.alert('Error', 'Failed to sign in with Facebook');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Facebook');
    } finally {
      setLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading('apple');
    try {
      const user = await signInWithApple();
      if (user) {
        onLoginSuccess(user);
      } else {
        Alert.alert('Error', 'Apple Sign-In is not yet configured');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Apple');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover Music</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={handleGoogleSignIn}
        disabled={loading !== null}>
        {loading === 'google' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign in with Google</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.facebookButton]}
        onPress={handleFacebookSignIn}
        disabled={loading !== null}>
        {loading === 'facebook' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign in with Facebook</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.appleButton]}
        onPress={handleAppleSignIn}
        disabled={loading !== null}>
        {loading === 'apple' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign in with Apple</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    maxWidth: 300,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;

