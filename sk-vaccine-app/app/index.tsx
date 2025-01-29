import { Text, View } from "react-native";
import logger from "@/utils/logger";

export default function Index() {

  logger.info("HEllo")


  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
