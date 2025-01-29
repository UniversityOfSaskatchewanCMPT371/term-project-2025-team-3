import {
  StyleSheet,
  Pressable,
  Text,
  ViewStyle,
  View,
  TextStyle,
} from 'react-native';
import { Link, LinkProps } from 'expo-router';
import logger from '@/utils/logger';

interface SquareButtonProps {
  path: LinkProps['href'];
  text: string;
  //onPress?: () => void; // Optional callback for additional actions
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function SquareButton({
  path,
  text,
  style,
  //onPress,
  textStyle,
}: SquareButtonProps) {
  const logPress = () => {
    logger.info('Square button pressed.');
  };

  return (
    <Link href={path as LinkProps['href']} asChild>
      <Pressable onPress={logPress}>
        <View style={[styles.container, style]}>
          <Text style={[styles.text, textStyle]}>
            {text.replace(' ', '\n')}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3E6BFF',
    justifyContent: 'center', // Center the text vertically
    alignItems: 'center', // Center the text horizontally
    borderRadius: 35,
  },
  text: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'semibold',
    textAlign: 'left',
  },
});
