// react/react-native imports
import { useEffect, useState, createContext, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Button,
  TextInput,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

// react-navigation imports
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// expo imports
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import { useFonts } from "expo-font";

const Stack = createNativeStackNavigator();
const db = SQLite.openDatabase("vault.db");
const ListContext = createContext();

// components
const Password = ({ navigation, description, pKey, pID }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [text, setText] = useState("Show password");

  const fetchPassword = async () => {
    try {
      const password = await SecureStore.getItemAsync(pKey);
      setText(password);
    } catch (error) {}
  };

  useEffect(() => {
    if (showPassword) {
      fetchPassword();
    } else {
      setText("Show password");
    }
  }, [showPassword]);

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1, marginLeft: 25 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 4,
              color: "#333",
            }}
          >
            {description}
          </Text>
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Text style={{ fontSize: 16, color: "#6d6d6d" }}>{text}</Text>
          </Pressable>
        </View>
        <View style={{ marginRight: 25, justifyContent: "center" }}>
          <Button
            title="Edit"
            color="#8052d0"
            onPress={() =>
              navigation.navigate("EditPassword", {
                description: description,
                pKey: pKey,
                pID: pID,
              })
            }
          />
        </View>
      </View>
    </View>
  );
};
const Logo = () => {
  const [loaded] = useFonts({
    CreteRound: require("./assets/CreteRound-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  } else {
    return (
      <Text
        style={{
          fontFamily: "CreteRound",
          fontSize: 28,
          fontWeight: "bold",
          color: "#333",
          marginBottom: 2,
        }}
      >
        Vault
      </Text>
    );
  }
};

// screens
const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [passwords, setPasswords] = useState([]);

  const { updateList, setUpdateList } = useContext(ListContext);

  useEffect(() => {
    loadPasswords();
  }, []);

  useEffect(() => {
    if (updateList) {
      loadPasswords();
      setUpdateList(false);
    }
  }, [updateList]);

  const loadPasswords = () => {
    setRefreshing(true);
    db.transaction((tx) => {
      tx.executeSql("select * from password", [], (_, { rows: { _array } }) => {
        setPasswords(_array);
      });
    });
    setRefreshing(false);
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
    <View style={{ flex: 1, backgroundColor: "#f5efe0" }}>
      <FlatList
        contentContainerStyle={{ marginTop: 15 }}
        data={passwords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Password
            description={item.description}
            pKey={item.key}
            pID={item.id}
            navigation={navigation}
          />
        )}
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

  const { setUpdateList } = useContext(ListContext);

  const createNewPassword = () => {
    const key = uuidv4();
    storePasswordMetaData(key);
  };

  const storePasswordMetaData = (key) => {
    setSaveButtonPressed(true);
    db.transaction((tx) => {
      tx.executeSql(
        "insert into password (description, key) values (?, ?)",
        [description, key],
        (txObj, resultSet) => {
          storePassword(key);
          setUpdateList(true);
          navigation.goBack();
        },
        (txObj, error) => {}
      );
    });
  };

  const storePassword = async (key) => {
    try {
      await SecureStore.setItemAsync(key, password);
    } catch (error) {}
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
          onPress={() => createNewPassword()}
          title="Save"
          color="#8052d0"
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
      style={{ flex: 1, backgroundColor: "#f5efe0", paddingTop: 20 }}
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
          selectionColor="#8052d0"
          autoFocus
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
          selectionColor="#8052d0"
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
          autoCapitalize="none"
        />
      </View>
    </ScrollView>
  );
};
const EditPasswordScreen = ({ navigation, route }) => {
  const [description, setDescription] = useState(route.params.description);
  const [password, setPassword] = useState("");
  const [saveButtonPressed, setSaveButtonPressed] = useState(false);

  const { setUpdateList } = useContext(ListContext);

  const showAlert = () =>
    Alert.alert("Delete this password?", "", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => deletePassword(),
        style: "destructive",
      },
    ]);

  const updateData = () => {
    setSaveButtonPressed(true);
    db.transaction((tx) => {
      tx.executeSql(
        "update password set description = ? where id = ?",
        [description, route.params.pID],
        (txObj, resultSet) => {
          setUpdateList(true);
          if (password) {
            updatePassword();
          } else {
            navigation.goBack();
          }
        },
        (txObj, error) => {}
      );
    });
  };

  const updatePassword = async () => {
    await SecureStore.setItemAsync(route.params.pKey, password);
    navigation.goBack();
  };

  const deletePassword = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "delete from password where id = ?",
        [route.params.pID],
        (txObj, resultSet) => {
          deleteFromStore();
          setUpdateList(true);
        },
        (txObj, error) => {}
      );
    });
  };

  const deleteFromStore = async () => {
    await SecureStore.deleteItemAsync(route.params.pKey);
    navigation.goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          style={{ marginLeft: -5 }}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={30} color="#333" />
        </Pressable>
      ),
      headerRight: () => (
        <Button
          onPress={() => updateData()}
          title="Update"
          color="#8052d0"
          disabled={
            (description.trim().length !== 0 &&
              password.trim().length !== 0 &&
              !saveButtonPressed) ||
            (description.trim() != route.params.description &&
              description.trim().length !== 0)
              ? false
              : true
          }
        />
      ),
    });
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5efe0", paddingTop: 20 }}>
      <View style={{ marginHorizontal: 12, marginBottom: 15 }}>
        <Text style={{ fontSize: 17, marginBottom: 5, color: "#333" }}>
          Description
        </Text>
        <TextInput
          value={description}
          onChangeText={(text) => setDescription(text)}
          placeholder="Update your description."
          selectionColor="#8052d0"
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
      <View style={{ marginHorizontal: 12, marginBottom: 15 }}>
        <Text style={{ fontSize: 17, marginBottom: 5, color: "#333" }}>
          Password
        </Text>
        <TextInput
          value={password}
          onChangeText={(text) => setPassword(text)}
          placeholder="Update your password."
          selectionColor="#8052d0"
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
          autoCapitalize="none"
        />
      </View>
      <View
        style={{
          borderTopWidth: 0.5,
          borderTopColor: "#c3c3c3",
          marginTop: 15,
          marginHorizontal: 5,
          paddingTop: 5,
        }}
      >
        <Button title="Delete Password" color="#d51e1e" onPress={showAlert} />
      </View>
    </ScrollView>
  );
};

export default function App() {
  const [updateList, setUpdateList] = useState(false);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists password (id integer primary key not null, description text, key text);"
      );
    });
  }, []);

  return (
    <ListContext.Provider value={{ updateList, setUpdateList }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerTitleStyle: { fontSize: 17, color: "#333" },
            headerStyle: { backgroundColor: "#f5efe0" },
          }}
        >
          <Stack.Group>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerTitle: () => <Logo />,
              }}
            />
            <Stack.Screen
              name="EditPassword"
              component={EditPasswordScreen}
              options={{ title: "Edit Password" }}
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
    </ListContext.Provider>
  );
}
