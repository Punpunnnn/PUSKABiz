// SplashScreen.js
import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    return () => {
      fadeAnim.setValue(0);
    };
  }, []);

  return (
    <View style={styles.container}>
    <Image source={require('../../../assets/PuskaBiz.png')} style={{ width: 200, height: 200 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default SplashScreen;
