// react/react-native imports
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Button,
  TextInput,
  ScrollView,
  RefreshControl,
} from "react-native";

// react-navigation imports
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// expo imports
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";

const Stack = createNativeStackNavigator();
const db = SQLite.openDatabase("vault.db");

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [passwords, setPasswords] = useState([]);

  useEffect(() => {
    loadPasswords();
  }, []);

  const loadPasswords = () => {
    setRefreshing(true);
    db.transaction((tx) => {
      tx.executeSql("select * from password", [], (_, { rows: { _array } }) => {
        setPasswords(_array);
        setRefreshing(false);
      });
    });
  };

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
        data={passwords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.key}</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadPasswords} />
        }
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
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [saveButtonPressed, setSaveButtonPressed] = useState(false);

  const addPassword = () => {
    setSaveButtonPressed(true);
    db.transaction((tx) => {
      tx.executeSql(
        "insert into password (key) values (?)",
        [description],
        (txObj, resultSet) => {
          navigation.goBack();
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 17, fontWeight: 300, color: "#333" }}>
            Cancel
          </Text>
        </Pressable>
      ),
      headerRight: () => (
        <Button
          onPress={() => addPassword()}
          title="Save"
          color="#9370DB"
          disabled={
            description.trim().length !== 0 &&
            password.trim().length !== 0 &&
            !saveButtonPressed
              ? false
              : true
          }
        />
      ),
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
          value={description}
          onChangeText={(text) => setDescription(text)}
          placeholder="What is this password for?"
          selectionColor="#9370DB"
          autoFocus
          spellCheck={false}
          blurOnSubmit={false}
          placeholderTextColor="#767676"
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
          value={password}
          onChangeText={(text) => setPassword(text)}
          placeholder="Enter password here."
          selectionColor="#9370DB"
          spellCheck={false}
          blurOnSubmit={false}
          placeholderTextColor="#767676"
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
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists password (id integer primary key not null, key text);"
      );

      // uncomment to delete all saved data (REMOVE BEFORE RELEASING)
      //tx.executeSql("delete from password;");
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerTitleStyle: { fontSize: 17, color: "#333" } }}
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
