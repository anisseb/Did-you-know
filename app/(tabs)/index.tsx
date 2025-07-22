import { collection, DocumentData, getDocs, limit, orderBy, query, QueryDocumentSnapshot, startAfter } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { db } from "../../firebase";

const PAGE_SIZE = 10;

type Anecdote = {
  id: string;
  question: string;
  answer: string;
};

export default function Home() {
  const [anecdotes, setAnecdotes] = useState<Anecdote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [endReached, setEndReached] = useState(false);

  const fetchAnecdotes = useCallback(async (loadMore = false) => {
    if (loadMore && (loadingMore || endReached)) return;
    if (!loadMore) setLoading(true);
    else setLoadingMore(true);
    try {
      let q = query(
        collection(db, "anecdotes"),
        orderBy("question"),
        limit(PAGE_SIZE)
      );
      if (loadMore && lastDoc) {
        q = query(
          collection(db, "anecdotes"),
          orderBy("question"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }
      const snapshot = await getDocs(q);
      const newAnecdotes: Anecdote[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anecdote));
      if (loadMore) {
        setAnecdotes(prev => [...prev, ...newAnecdotes]);
      } else {
        setAnecdotes(newAnecdotes);
      }
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      if (snapshot.docs.length < PAGE_SIZE) setEndReached(true);
    } catch (e) {
      // Gérer l'erreur
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc, loadingMore, endReached]);

  useEffect(() => {
    fetchAnecdotes();
  }, []);

  const renderItem = ({ item }: { item: Anecdote }) => (
    <View style={styles.card}>
      <Text style={styles.question}>{item.question}</Text>
      <Text style={styles.answer}>{item.answer}</Text>
    </View>
  );

  if (loading && anecdotes.length === 0) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <FlatList
      data={anecdotes}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      onEndReached={() => fetchAnecdotes(true)}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loadingMore ? <ActivityIndicator /> : null}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  question: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  answer: {
    fontSize: 15,
    color: '#333',
  },
}); 