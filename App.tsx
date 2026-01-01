import React, {useEffect, useState} from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';

// Use web-compatible modules for web, native for mobile
const isWeb = typeof window !== 'undefined' && !window.navigator.userAgent.includes('ReactNative');
const databaseModule = isWeb 
  ? require('./src/utils/database.web')
  : require('./src/utils/database');
const {createTables} = databaseModule;

const authModule = isWeb
  ? require('./src/services/auth.web')
  : require('./src/services/auth');
const {getCurrentUser, signOut} = authModule;

// Import User type from the appropriate module
interface User {
  id: string;
  name: string;
  email?: string;
  provider: 'google' | 'facebook' | 'apple';
  photo?: string;
}

import LoginScreen from './src/components/LoginScreen';
import MainScreen from './src/screens/MainScreen';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await createTables();
      
      // Check if user is logged in
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  const handleContinueWithoutLogin = () => {
    // Create a guest user object
    const guestUser: User = {
      id: 'guest',
      name: 'Guest',
      provider: 'google', // Default provider, not used for guest
    };
    setUser(guestUser);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? (
        <MainScreen user={user} onLogout={handleLogout} />
      ) : (
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess} 
          onContinueWithoutLogin={handleContinueWithoutLogin}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default App;

