import { StyleSheet, Pressable, Text, ViewStyle, View } from 'react-native';
import { Link, LinkProps } from 'expo-router';
import logger from '@/utils/logger';

interface SquareButtonProps {
  path: LinkProps['href'];
  text: string;
  //onPress?: () => void; // Optional callback for additional actions
  style?: ViewStyle;
}

export default function SquareButton({
  path,
  text,
  style,
  //onPress,
}: SquareButtonProps) {

  const logPress = () => {
    logger.info("Square button pressed.")
  }

 
  return (
    <Link href={"/test" as LinkProps["href"]} asChild>
      <Pressable onPress={logPress}>
        <View style={[styles.container, style]}>
          <Text style={styles.text}>{text}</Text>
        </View>
        </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    backgroundColor: '#3E6BFF',
    justifyContent: 'center', // Center the text vertically
    alignItems: 'center', // Center the text horizontally
   
    borderRadius: 35,
    marginHorizontal: 5,
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
