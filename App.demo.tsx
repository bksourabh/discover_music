import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import MainScreen from './src/screens/MainScreen';

// User type
interface User {
  id: string;
  name: string;
  email?: string;
  provider: 'google' | 'facebook' | 'apple';
  photo?: string;
}

// @ts-ignore - window is available in web environments
const isWeb = typeof window !== 'undefined' && !window.navigator.userAgent.includes('ReactNative');

/**
 * Demo version of App that skips login and goes directly to MainScreen
 */
const App: React.FC = () => {
  // Mock user for demo mode
  const mockUser: User = {
    id: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@example.com',
    provider: 'google',
  };

  useEffect(() => {
    // Initialize database asynchronously, don't block rendering
    const initDb = async () => {
      try {
        const {createTables} = await import('./src/utils/database.web');
        await createTables();
      } catch (error) {
        console.error('Database init error:', error);
      }
    };
    
    initDb();
  }, []);

  const handleLogout = async () => {
    if (isWeb) {
      window.location.reload();
    }
  };

  return (
    <View style={styles.container}>
      <MainScreen user={mockUser} onLogout={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
    height: '100%',
  },
});

export default App;
