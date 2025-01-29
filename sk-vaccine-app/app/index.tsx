import SquareButton from '@/components/home-btn-square';
import { StyleSheet, Text, View, Image } from 'react-native';
import logger from '@/utils/logger';

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{flexDirection: "row", flex: 1, alignItems: 'center'}}>
        <Image source={require('@/assets/images/sasklogo-tra.png')} style={{width: 40, height: 40}}/>
        <Text style={{fontSize: 45, flexWrap: 'wrap', flex:1}}>{`Sask\nImmunize`}</Text>
      </View>
      <View style={styles.horizontalContainer}>
        <View style={styles.btnContainer}>
          <SquareButton
            path={'/'}
            text="Vaccine Info"
            style={{ backgroundColor: '#3E6BFF', aspectRatio: 1}}
          />
        </View>
        <View style={styles.btnContainer}>
          <SquareButton
            path={'/'}
            text="Vaccine Info"
            style={{ backgroundColor: '#74FF99', aspectRatio: 1}}
          />
        </View>
      </View>
      <View style={styles.horizontalContainer}>
        <View style={styles.btnContainer}>
          <SquareButton
            path={'/'}
            text="Vaccine Info"
            style={{ backgroundColor: '#FFC250', aspectRatio: 1}}
          />
        </View>
        <View style={styles.btnContainer}>
          <SquareButton
            path={'/'}
            text="Vaccine Info"
            style={{ backgroundColor: '#FF8787', aspectRatio: 1}}
          />
        </View>
      </View>
      <View>
        <SquareButton path={'/'} text="My Records" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  btnContainer: {
    flex: 1,
  },
});
