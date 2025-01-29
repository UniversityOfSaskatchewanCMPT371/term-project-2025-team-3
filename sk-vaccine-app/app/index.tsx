import SquareButton from "@/components/home-btn-square";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
     
      <SquareButton path={"/"} text="Clinic Information" style={{backgroundColor: "green"}}></SquareButton>
      <SquareButton path={"/"} text="Vaccine Info"></SquareButton>
      <SquareButton path={"/"} text="Vaccine Info"></SquareButton>
    </View>
  );
}
