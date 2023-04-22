// react/react-native imports
import { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Button,
  TextInput,
  ScrollView,
} from "react-native";

// react-navigation imports
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// expo imports
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();

const HomeScreen = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("NewPassword")}>
          <Feather
            name="plus"
            size={28}
            color="#333"
            style={{ marginRight: 5 }}
          />
        </Pressable>
      ),
    });
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 35,
              fontSize: 16,
              color: "#333",
            }}
          >
            Press "+" at the top to save a password
          </Text>
        }
      />
    </View>
  );
};

const NewPasswordScreen = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 17, fontWeight: 300, color: "#333" }}>
            Cancel
          </Text>
        </Pressable>
      ),
      headerRight: () => <Button title="Save" color="#9370DB" />,
    });
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff", paddingTop: 20 }}
      keyboardShouldPersistTaps="always"
    >
      <View style={{ marginHorizontal: 12, marginBottom: 15 }}>
        <Text style={{ fontSize: 17, marginBottom: 5, color: "#333" }}>
          Description
        </Text>
        <TextInput
          placeholder="What is this password for?"
          selectionColor="#9370DB"
          autoFocus
          spellCheck={false}
          blurOnSubmit={false}
          style={{
            height: 45,
            borderWidth: 1,
            padding: 10,
            borderColor: "#c3c3c3",
            borderRadius: 4,
            fontSize: 15,
          }}
        />
      </View>
      <View style={{ marginHorizontal: 12 }}>
        <Text style={{ fontSize: 17, marginBottom: 5, color: "#333" }}>
          Password
        </Text>
        <TextInput
          placeholder="Enter password here."
          selectionColor="#9370DB"
          spellCheck={false}
          blurOnSubmit={false}
          style={{
            height: 45,
            borderWidth: 1,
            padding: 10,
            borderColor: "#c3c3c3",
            borderRadius: 4,
            fontSize: 15,
          }}
        />
      </View>
    </ScrollView>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerTitleStyle: { fontSize: 18, color: "#333" } }}
      >
        <Stack.Group>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: "Vault",
            }}
          />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen
            name="NewPassword"
            component={NewPasswordScreen}
            options={{ title: "Save a Password" }}
          />
        </Stack.Group>
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
