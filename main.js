import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SQLite from "react-native-sqlite-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configuração do SQLite
const db = SQLite.openDatabase({ name: "mei.db", location: "default" });

// Tela de Vendas
const SalesScreen = () => {
  const [sales, setSales] = useState([]);
  const [newSale, setNewSale] = useState({
    customer: "",
    product: "",
    amount: "",
  });

  const loadSales = async () => {
    try {
      const savedSales = await AsyncStorage.getItem("sales");
      if (savedSales) setSales(JSON.parse(savedSales));
    } catch (e) {
      console.error("Erro ao carregar vendas:", e);
    }
  };

  const addSale = async () => {
    try {
      const updatedSales = [
        ...sales,
        { ...newSale, date: new Date().toLocaleDateString() },
      ];
      await AsyncStorage.setItem("sales", JSON.stringify(updatedSales));
      setSales(updatedSales);
      setNewSale({ customer: "", product: "", amount: "" });
    } catch (e) {
      console.error("Erro ao salvar venda:", e);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Cliente"
        value={newSale.customer}
        onChangeText={(text) => setNewSale({ ...newSale, customer: text })}
      />
      <TextInput
        placeholder="Produto"
        value={newSale.product}
        onChangeText={(text) => setNewSale({ ...newSale, product: text })}
      />
      <TextInput
        placeholder="Valor"
        keyboardType="numeric"
        value={newSale.amount}
        onChangeText={(text) => setNewSale({ ...newSale, amount: text })}
      />
      <Button title="Registrar Venda" onPress={addSale} />

      <FlatList
        data={sales}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>
              {item.date} - {item.customer}
            </Text>
            <Text>
              {item.product} - R$ {item.amount}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

// Tela de Estoque
const InventoryScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    quantity: "",
    price: "",
  });

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, quantity INT, price REAL);"
      );
      tx.executeSql("SELECT * FROM inventory;", [], (_, { rows }) => {
        setInventory(rows._array);
      });
    });
  }, []);

  const addProduct = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO inventory (name, quantity, price) VALUES (?, ?, ?);",
        [newProduct.name, newProduct.quantity, newProduct.price],
        (_, result) => {
          setInventory([...inventory, { ...newProduct, id: result.insertId }]);
          setNewProduct({ name: "", quantity: "", price: "" });
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nome do Produto"
        value={newProduct.name}
        onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
      />
      <TextInput
        placeholder="Quantidade"
        keyboardType="numeric"
        value={newProduct.quantity}
        onChangeText={(text) =>
          setNewProduct({ ...newProduct, quantity: text })
        }
      />
      <TextInput
        placeholder="Preço"
        keyboardType="numeric"
        value={newProduct.price}
        onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
      />
      <Button title="Adicionar ao Estoque" onPress={addProduct} />

      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.name}</Text>
            <Text>Quantidade: {item.quantity}</Text>
            <Text>Preço: R$ {item.price}</Text>
          </View>
        )}
      />
    </View>
  );
};

// Tela de Agendamentos
const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    date: "",
    description: "",
  });

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, description TEXT);"
      );
      tx.executeSql("SELECT * FROM appointments;", [], (_, { rows }) => {
        setAppointments(rows._array);
      });
    });
  }, []);

  const addAppointment = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO appointments (date, description) VALUES (?, ?);",
        [newAppointment.date, newAppointment.description],
        (_, result) => {
          setAppointments([
            ...appointments,
            { ...newAppointment, id: result.insertId },
          ]);
          setNewAppointment({ date: "", description: "" });
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Data (DD/MM/AAAA)"
        value={newAppointment.date}
        onChangeText={(text) =>
          setNewAppointment({ ...newAppointment, date: text })
        }
      />
      <TextInput
        placeholder="Descrição"
        value={newAppointment.description}
        onChangeText={(text) =>
          setNewAppointment({ ...newAppointment, description: text })
        }
      />
      <Button title="Agendar" onPress={addAppointment} />

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.date}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};

// Configuração da Navegação
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Vendas" component={SalesScreen} />
        <Tab.Screen name="Estoque" component={InventoryScreen} />
        <Tab.Screen name="Agendamentos" component={AppointmentsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  listItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
});
