import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { lavouraService } from '../../../src/services/lavouraService';
import { LavouraCard } from '../../../src/components/LavouraCard';
import { EmptyState } from '../../../src/components/EmptyState';
import { Loading } from '../../../src/components/Loading';
import { Lavoura } from '../../../src/types';
import { colors, spacing, radius } from '../../../src/theme/colors';

export default function LavourasListScreen() {
  const router = useRouter();
  const [lavouras, setLavouras] = useState<Lavoura[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLavouras = useCallback(async () => {
    try {
      const data = await lavouraService.listar();
      setLavouras(data);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar as lavouras. Verifique se a API está online.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLavouras();
    }, [fetchLavouras])
  );

  function handleRefresh() {
    setRefreshing(true);
    fetchLavouras();
  }

  if (loading) {
    return <Loading message="Carregando lavouras..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lavouras}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <LavouraCard
            lavoura={item}
            onPress={() => router.push(`/(tabs)/lavouras/${item.id}`)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          lavouras.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="🌾"
            title="Nenhuma lavoura"
            message="Cadastre sua primeira lavoura para começar o monitoramento."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accentPrimary}
            colors={[colors.accentPrimary]}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/lavouras/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  list: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
