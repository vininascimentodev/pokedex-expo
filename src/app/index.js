import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=60";

// A lista da API só traz nome e url, então pego o id pela url
// e monto o link da imagem oficial.
const getId = (url) => url.split("/").filter(Boolean).pop();
const getImage = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const json = await response.json();
      setItems(
        json.results.map((p) => {
          const id = getId(p.url);
          return { id, name: p.name, image: getImage(id) };
        })
      );
    } catch (e) {
      setError(e.message || "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filtered = useMemo(
    () => items.filter((i) => i.name.includes(search.trim().toLowerCase())),
    [items, search]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2b6cb0" />
        <Text style={styles.muted}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Falha ao carregar</Text>
        <Text style={styles.muted}>{error}</Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            setLoading(true);
            loadData();
          }}
        >
          <Text style={styles.buttonText}>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Pokédex</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar pelo nome"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={[styles.muted, styles.empty]}>
            Nenhum resultado para "{search}".
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.id}>#{item.id}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", paddingTop: 12 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f5f7fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a202c",
    marginHorizontal: 16,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 16,
    fontSize: 16,
  },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  row: { justifyContent: "space-between" },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    alignItems: "center",
    padding: 12,
    margin: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: 110, height: 110 },
  id: { color: "#718096", fontSize: 12, marginTop: 6 },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a202c",
    textTransform: "capitalize",
  },
  muted: { color: "#718096", marginTop: 8, textAlign: "center" },
  empty: { marginTop: 32 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#c53030" },
  button: {
    backgroundColor: "#2b6cb0",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});