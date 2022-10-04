import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Button,
} from "react-native";

const db = SQLite.openDatabase("shoppinglist.db");

export default function App() {
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "CREATE TABLE if not exists shoppinglist (id integer primary key NOT NULL, product text, amount text);"
        );
      },
      null,
      updateItems
    );
  }, []);

  const handleSave = () => {
    if (product.length > 0) {
      db.transaction(
        (tx) => {
          tx.executeSql(
            "INSERT INTO shoppinglist (product, amount) VALUES (?, ?);",
            [product, amount]
          );
        },
        null,
        updateItems
      );
      setProduct("");
      setAmount("");
    }
  };

  const handleDelete = (id) => {
    db.transaction(
      (tx) => tx.executeSql("DELETE FROM shoppinglist WHERE id = ?;", [id]),
      null,
      updateItems
    );
  };

  const updateItems = () => {
    db.transaction(
      (tx) => {
        tx.executeSql("SELECT * FROM shoppinglist;", [], (_, { rows }) =>
          setItems(rows._array)
        );
      },
      null,
      null
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setProduct(text)}
        value={product}
        placeholder="Product"
      />
      <TextInput
        style={styles.input}
        onChangeText={(text) => setAmount(text)}
        value={amount}
        placeholder="Amount"
      />
      <View style={styles.btnContainer}>
        <Button title="ADD" onPress={handleSave} />
      </View>
      <View style={styles.listContainer}>
        {items.length > 0 ? (
          <Text style={styles.text}>Shopping List</Text>
        ) : (
          <Text style={styles.textSecondary}>List empty.</Text>
        )}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.list}>
              <Text>
                {item.product}, {item.amount}
              </Text>
              <Text
                style={styles.textSecondary}
                onPress={() => handleDelete(item.id)}
              >
                Bought
              </Text>
            </View>
          )}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 150,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    width: 200,
    height: 40,
    borderRadius: 5,
    textAlign: "center",
    marginBottom: 7,
  },
  btnContainer: {
    flexDirection: "row",
    margin: 10,
  },
  text: {
    fontSize: 18,
    margin: 8,
  },
  textSecondary: {
    color: "darkgrey",
    marginLeft: 5,
  },
  listContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: 3,
  },
  list: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 6,
  },
});
