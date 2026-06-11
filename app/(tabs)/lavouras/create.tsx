import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { lavouraService } from '../../../src/services/lavouraService';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { LavouraFormData } from '../../../src/types';
import { colors, spacing, radius } from '../../../src/theme/colors';

export default function CreateLavouraScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<LavouraFormData>({
    nome: '',
    tipo: '',
    area: '',
    latitude: '',
    longitude: '',
    descricao: '',
    status: 'ATIVA',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField(field: keyof LavouraFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!form.tipo.trim()) newErrors.tipo = 'Tipo de cultura é obrigatório';
    if (!form.area.trim()) newErrors.area = 'Área é obrigatória';
    else if (isNaN(Number(form.area)) || Number(form.area) <= 0) newErrors.area = 'Área inválida';
    if (!form.latitude.trim()) newErrors.latitude = 'Latitude é obrigatória';
    else if (isNaN(Number(form.latitude))) newErrors.latitude = 'Latitude inválida';
    if (!form.longitude.trim()) newErrors.longitude = 'Longitude é obrigatória';
    else if (isNaN(Number(form.longitude))) newErrors.longitude = 'Longitude inválida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleCreate() {
    if (!validate()) return;
    setLoading(true);
    try {
      await lavouraService.criar(form);
      setForm({
        nome: '',
        tipo: '',
        area: '',
        latitude: '',
        longitude: '',
        descricao: '',
        status: 'ATIVA',
      });
      Alert.alert('Sucesso', 'Lavoura cadastrada com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao cadastrar lavoura.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.emoji}>🌱</Text>
            <Text style={styles.title}>Nova Lavoura</Text>
            <Text style={styles.subtitle}>Preencha os dados da sua lavoura</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nome da Lavoura"
              value={form.nome}
              onChangeText={(v) => updateField('nome', v)}
              placeholder="Ex: Fazenda Santa Maria"
              error={errors.nome}
            />

            <Input
              label="Tipo de Cultura"
              value={form.tipo}
              onChangeText={(v) => updateField('tipo', v)}
              placeholder="Ex: Soja, Milho, Café"
              error={errors.tipo}
            />

            <Input
              label="Área (hectares)"
              value={form.area}
              onChangeText={(v) => updateField('area', v)}
              placeholder="Ex: 150.5"
              keyboardType="decimal-pad"
              error={errors.area}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Input
                  label="Latitude"
                  value={form.latitude}
                  onChangeText={(v) => updateField('latitude', v)}
                  placeholder="Ex: -23.55"
                  keyboardType="numbers-and-punctuation"
                  error={errors.latitude}
                />
              </View>
              <View style={styles.half}>
                <Input
                  label="Longitude"
                  value={form.longitude}
                  onChangeText={(v) => updateField('longitude', v)}
                  placeholder="Ex: -46.63"
                  keyboardType="numbers-and-punctuation"
                  error={errors.longitude}
                />
              </View>
            </View>

            <Input
              label="Descrição (opcional)"
              value={form.descricao}
              onChangeText={(v) => updateField('descricao', v)}
              placeholder="Detalhes adicionais da lavoura"
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top', paddingTop: 12 }}
            />

            <Button title="Cadastrar Lavoura" onPress={handleCreate} loading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  emoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  form: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
});
