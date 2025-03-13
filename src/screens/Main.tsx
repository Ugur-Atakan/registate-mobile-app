import { Text, View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';


export default function MainScreen(){
    return(
        <View>
            <Text>Main</Text>
            <Ionicons name="checkmark-circle" size={32} color="green" />
        </View>
    );
} 
