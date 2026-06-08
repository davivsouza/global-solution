import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { lavouraService } from '../../../src/services/lavouraService';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { Loading } from '../../../src/components/Loading';
import { Lavoura, LavouraFormData } from '../../../src/types';
import { colors, spacing, radius } from '../../../src/theme/colors';

const statusOptions: { value: Lavoura['status']; label: string; color: string }[] = [
  { value: 'ATIVA', label: 'Ativa', color: colors.colorSuccess },
  { value: 'INATIVA', label: 'Inativa', color: colors.textDim },
  { value: 'COLHEITA', label: 'Colheita', color: colors.colorWarning },
];

export default function LavouraDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [lavoura, setLavoura] = useState<Lavoura | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<LavouraFormData>({
    nome: '', tipo: '', area: '', latitude: '', longitude: '', descricao: '', status: 'ATIVA',
  });

  useEffect(() => {
    fetchLavoura();
  }, [id]);

  async function fetchLavoura() {
    try {
      const data = await lavouraService.buscarPorId(Number(id));
      setLavoura(data);
      setForm({
        nome: data.nome,
        tipo: data.tipo,
        area: data.area.toString(),
        latitude: data.latitude.toString(),
        longitude: data.longitude.toString(),
        descricao: data.descricao || '',
        status: data.status,
      });
    } catch (error) {
      Alert.alert('Erro', 'Lavoura não encontrada.', [
        { text: 'Voltar', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof LavouraFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await lavouraService.atualizar(Number(id), form);
      Alert.alert('Sucesso', 'Lavoura atualizada!');
      setEditing(false);
      fetchLavoura();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao atualizar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja excluir "${lavoura?.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await lavouraService.deletar(Number(id));
              Alert.alert('Sucesso', 'Lavoura excluída.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir lavoura.');
            }
          },
        },
      ]
    );
  }

  if (loading) return <Loading message="Carregando lavoura..." />;
  if (!lavoura) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Info Header */}
        <View style={styles.infoHeader}>
          <Text style={styles.infoEmoji}>
            {lavoura.tipo === 'Soja' ? '🌱' : lavoura.tipo === 'Milho' ? '🌽' : lavoura.tipo === 'Café' ? '☕' : '🌿'}
          </Text>
          <Text style={styles.infoName}>{lavoura.nome}</Text>
          <Text style={styles.infoMeta}>{lavoura.tipo} · {lavoura.area} ha</Text>
          <Text style={styles.infoCoords}>
            📍 {lavoura.latitude.toFixed(4)}, {lavoura.longitude.toFixed(4)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, editing && styles.actionBtnActive]}
            onPress={() => setEditing(!editing)}
          >
            <Ionicons name={editing ? 'close' : 'create-outline'} size={18} color={colors.accentPrimary} />
            <Text style={styles.actionText}>{editing ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.colorDanger} />
            <Text style={[styles.actionText, { color: colors.colorDanger }]}>Excluir</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Form */}
        {editing && (
          <View style={styles.form}>
            <Input label="Nome" value={form.nome} onChangeText={(v) => updateField('nome', v)} />
            <Input label="Tipo de Cultura" value={form.tipo} onChangeText={(v) => updateField('tipo', v)} />
            <Input label="Área (ha)" value={form.area} onChangeText={(v) => updateField('area', v)} keyboardType="decimal-pad" />
            
            <View style={styles.row}>
              <View style={styles.half}>
                <Input label="Latitude" value={form.latitude} onChangeText={(v) => updateField('latitude', v)} keyboardType="numbers-and-punctuation" />
              </View>
              <View style={styles.half}>
                <Input label="Longitude" value={form.longitude} onChangeText={(v) => updateField('longitude', v)} keyboardType="numbers-and-punctuation" />
              </View>
            </View>

            <Input label="Descrição" value={form.descricao} onChangeText={(v) => updateField('descricao', v)} multiline style={{ height: 80, textAlignVertical: 'top', paddingTop: 12 }} />

            {/* Status Selector */}
            <Text style={styles.statusLabel}>STATUS</Text>
            <View style={styles.statusRow}>
              {statusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.statusChip,
                    form.status === opt.value && { backgroundColor: opt.color + '20', borderColor: opt.color },
                  ]}
                  onPress={() => updateField('status', opt.value)}
                >
                  <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                  <Text style={[styles.statusChipText, form.status === opt.value && { color: opt.color }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button title="Salvar Alterações" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
          </View>
        )}

        {/* Read-only details */}
        {!editing && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Informações</Text>
            <DetailRow label="Status" value={statusOptions.find(s => s.value === lavoura.status)?.label || lavoura.status} />
            <DetailRow label="Cultura" value={lavoura.tipo} />
            <DetailRow label="Área" value={`${lavoura.area} hectares`} />
            <DetailRow label="Latitude" value={lavoura.latitude.toString()} />
            <DetailRow label="Longitude" value={lavoura.longitude.toString()} />
            {lavoura.descricao ? <DetailRow label="Descrição" value={lavoura.descricao} /> : null}
            <DetailRow label="Cadastrada em" value={new Date(lavoura.dataCriacao).toLocaleDateString('pt-BR')} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
  },
  value: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  infoHeader: {
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
  },
  infoEmoji: { fontSize: 48, marginBottom: spacing.sm },
  infoName: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  infoMeta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  infoCoords: { fontSize: 13, color: colors.textDim, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  actionBtnActive: { borderColor: colors.accentPrimary, backgroundColor: 'rgba(16, 185, 129, 0.08)' },
  actionBtnDanger: { borderColor: 'rgba(239, 68, 68, 0.2)' },
  actionText: { fontSize: 14, fontWeight: '600', color: colors.accentPrimary },
  form: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.xxl,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  statusLabel: { fontSize: 13, fontWeight: '500', color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statusChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    backgroundColor: colors.bgInput,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusChipText: { fontSize: 12, fontWeight: '600', color: colors.textDim },
  detailsCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.xxl,
  },
  detailsTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
});
