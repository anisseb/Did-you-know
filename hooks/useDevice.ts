import { Dimensions, Platform } from 'react-native';

export const useDevice = () => {
  const { width, height } = Dimensions.get('window');
  
  // Détecter si c'est une tablette
  const isTablet = () => {
    const { width, height } = Dimensions.get('window');
    const aspectRatio = height / width;
    
    // Pour iOS
    if (Platform.OS === 'ios') {
      return aspectRatio <= 1.6;
    }
    
    // Pour Android
    if (Platform.OS === 'android') {
      return width >= 600;
    }
    
    return false;
  };
  
  const isTabletDevice = isTablet();
  
  // Facteurs d'échelle pour les tablettes
  const getScaleFactor = () => {
    if (isTabletDevice) {
      return 1.3; // 30% plus grand sur tablette
    }
    return 1;
  };
  
  const scaleFactor = getScaleFactor();
  
  return {
    isTablet: isTabletDevice,
    scaleFactor,
    width,
    height,
    // Dimensions adaptées pour les tablettes
    cardWidth: isTabletDevice ? width * 0.8 : width * 0.9,
    cardHeight: isTabletDevice ? height * 0.6 : height * 0.5,
    fontSize: {
      small: isTabletDevice ? 16 : 12,
      medium: isTabletDevice ? 20 : 16,
      large: isTabletDevice ? 28 : 22,
      xlarge: isTabletDevice ? 36 : 28,
    },
    spacing: {
      small: isTabletDevice ? 12 : 8,
      medium: isTabletDevice ? 20 : 16,
      large: isTabletDevice ? 32 : 24,
      xlarge: isTabletDevice ? 48 : 36,
    },
    iconSize: {
      small: isTabletDevice ? 20 : 16,
      medium: isTabletDevice ? 28 : 24,
      large: isTabletDevice ? 36 : 28,
      xlarge: isTabletDevice ? 48 : 32,
    }
  };
}; 