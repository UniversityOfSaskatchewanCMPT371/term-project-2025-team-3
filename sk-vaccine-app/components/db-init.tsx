import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import useInitDataSource from '@/hooks/initDataSource';
import logger from '@/utils/logger';

interface DatabaseInitializerProps {
  children: React.ReactNode;
}



/**
 * Initializes the database with typeorm. It displays a loading screen and an error
 * if it fails.
 */
export default function DatabaseInitializer({ children }: DatabaseInitializerProps): React.ReactNode {
  
  
  const { isReady, error } = useInitDataSource();

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: {error.toString()}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
