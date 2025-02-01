import SquareButton from '@/components/home-btn-square';
import { StyleSheet, Text, View, Image } from 'react-native';
// eslint-disable-next-line
import logger from '@/utils/logger';
import ChinButton from '@/components/home-btn-chin';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

/**
 * The home screen of the Sask Immunize app.
 * 
 * This screen provides navigation to various sections of the app, including vaccine information, 
 * clinic details, and personal records. It features a logo, title, and multiple navigation buttons.
 * 
 * @component
 * @returns {JSX.Element} - The rendered home screen component.
 
 */
export default function Index() {
  const navigation = useNavigation();

  const saskLogo = require('@/assets/images/sasklogo-tra.png');

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
        <Image source={saskLogo} style={{ width: 90, height: 120 }} />
        <Text
          style={{ fontSize: 45, flexWrap: 'wrap', flex: 1 }}
        >{`Sask\nImmunize`}</Text>
      </View>

      <View style={styles.horizontalContainer}>
        <View style={styles.btnContainer}>
          <SquareButton
            path={'/vaccine-info'}
            text="Vaccine Info"
            style={{ backgroundColor: '#3E6BFF', aspectRatio: 1 }}
          />
        </View>
        <View style={styles.btnContainer}>
          <SquareButton
            path={'/clinic-info'}
            text="Clinic Information"
            textStyle={{ color: 'black' }}
            style={{ backgroundColor: '#74FF99', aspectRatio: 1 }}
          />
        </View>
      </View>
      <View style={styles.horizontalContainer}>
        <View style={styles.btnContainer}>
          <SquareButton
            path={'/test'}
            text="Vaccine Info"
            style={{ backgroundColor: '#FFC250', aspectRatio: 1 }}
          />
        </View>
        <View style={styles.btnContainer}>
          <SquareButton
            path={'/test'}
            text="Vaccine Info"
            style={{ backgroundColor: '#FF8787', aspectRatio: 1 }}
          />
        </View>
      </View>
      <View>
        <ChinButton path={'/test'} text="My Records" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: 10,
    paddingHorizontal: 10,
    paddingBottom: 5,
    alignItems: 'center',
  },
  btnContainer: {
    flex: 1,
  },
});
