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


/**
 * A square button with rounded edges for the home page.
 * @component
 * @param {SquareButtonProps} props - The properties of the button.
 * @param {LinkProps['href']} props.path - The navigation path for the button.
 * @param {string} props.text - The text displayed inside the button.
 * @param {ViewStyle} [props.style] - Optional custom styles for the button container.
 * @param {TextStyle} [props.textStyle] - Optional custom styles for the text inside the button.
 * @returns {JSX.Element} The rendered button component.
 */
export default function SquareButton({
  path,
  text,
  style,
  //onPress,
  textStyle,
}: SquareButtonProps): JSX.Element {
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
