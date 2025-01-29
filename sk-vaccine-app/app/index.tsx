import SquareButton from '@/components/home-btn-square';
import { StyleSheet, Text, View } from 'react-native';
import logger from "@/utils/logger";

export default function Index() {

  logger.info("HEllo")


  return (
    <View style={styles.horizontalContainer}>
      <View style={styles.btnContainer}>
        <SquareButton
          path={'/'}
          text="Vaccine Info"
          style={{ backgroundColor: '#FFC250' }}
        />
      </View>
      <View style={styles.btnContainer}>
        <SquareButton
          path={'/'}
          text="Vaccine Info"
          style={{ backgroundColor: '#FF8787' }}
        />
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
