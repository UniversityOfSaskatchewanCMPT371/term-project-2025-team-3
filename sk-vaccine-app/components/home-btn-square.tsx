import { StyleSheet, Pressable, Text, ViewStyle, View } from 'react-native';
import { Link, LinkProps } from 'expo-router';

interface SquareButtonProps {
  path: LinkProps['href'];
  text: string;
  onPresss?: () => void; // Optional callback for additional actions
  style?: ViewStyle;
}

export default function SquareButton({
  path,
  text,
  style,
  onPresss,
}: SquareButtonProps) {

 
  return (
    <Link href={"/test" as LinkProps["href"]} asChild>
      <Pressable>
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
    borderRadius: 12,
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
