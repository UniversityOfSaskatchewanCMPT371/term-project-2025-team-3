import { StyleSheet, Pressable, Text, ViewStyle, View } from 'react-native';
import { Link, LinkProps } from 'expo-router';

interface SquareButtonProps {
  path: LinkProps['href'];
  text: string;
  onPress?: () => void; // Optional callback for additional actions
  style?: ViewStyle;
}

export default function SquareButton({
  path,
  text,
  style,
  onPress,
}: SquareButtonProps) {


    

  return (
    <Link href={"/test" as LinkProps["href"]} asChild>
      <View>
        <Pressable style={({ pressed }) => [styles.container, style]}>
          <Text style={styles.text}>{text}</Text>
        </Pressable>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3E6BFF',
    width: 120,
    height: 120,
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
