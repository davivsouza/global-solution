import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatBubble } from '../../src/components/ChatBubble';
import { ChatSuggestion } from '../../src/components/ChatSuggestion';
import { colors, radius, spacing } from '../../src/theme/colors';
import { useAuth } from '../../src/contexts/AuthContext';
import { lavouraService } from '../../src/services/lavouraService';
import { climateService, ClimateAnalysis } from '../../src/services/climateService';
import { Lavoura } from '../../src/types';
import { getAverage, getClimatePoints, getTotal } from '../../src/utils/climate';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const suggestions = [
  'Como está a situação da minha lavoura?',
  'Existe risco de seca nos próximos dias?',
  'Quando devo irrigar?',
  'O que significa NDVI baixo?',
];

function buildClimateContext(climate: ClimateAnalysis | null) {
  if (!climate) return undefined;

  const points = getClimatePoints(climate.climateData);
  const temperatures = points.map((point) => point.temperature);
  const precipitation = points.map((point) => point.precipitation);
  const ndvi = climate.ndviData?.ndvi;
  const moisture = climate.soilData?.moisture;

  return JSON.stringify({
    periodo: points.map((point) => point.label).join(', '),
    temperaturaMedia: temperatures.length > 0 ? Number(getAverage(temperatures).toFixed(1)) : null,
    precipitacaoTotal: precipitation.length > 0 ? Number(getTotal(precipitation).toFixed(1)) : null,
    ndvi: typeof ndvi === 'number' ? Number(ndvi.toFixed(2)) : ndvi,
    umidadeSoloPercentual: typeof moisture === 'number' ? Number((moisture * 100).toFixed(1)) : null,
  });
}

export default function ChatScreen() {
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [lavouras, setLavouras] = useState<Lavoura[]>([]);
  const [selectedLavouraId, setSelectedLavouraId] = useState<number | undefined>();
  const [climate, setClimate] = useState<ClimateAnalysis | null>(null);
  const [input, setInput] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Olá, eu sou o AgroSat AI. Posso ajudar a interpretar clima, NDVI, umidade do solo e próximos cuidados da lavoura.',
    },
  ]);

  const loadData = async (lavouraId?: number) => {
    try {
      setLoadingData(true);
      const data = await lavouraService.listar();
      setLavouras(data);

      const activeLavoura = data.find((item) => item.id === lavouraId) || data[0];
      setSelectedLavouraId(activeLavoura?.id);

      if (activeLavoura?.id) {
        const analysis = await climateService.getAnalysis(activeLavoura.id);
        setClimate(analysis);
      } else {
        setClimate(null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do chat:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      loadData(selectedLavouraId);
    }, [user])
  );

  const sendMessage = async (textToSend = input) => {
    const message = textToSend.trim();
    if (!message || sending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setSending(true);

    try {
      const context = buildClimateContext(climate);

      const response = await climateService.sendChatMessage(message, selectedLavouraId, context);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.resposta,
        },
      ]);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem para IA:', error);
      const errorText = error.code === 'ECONNABORTED'
        ? 'A AgroSat AI demorou mais que o esperado para responder. Tente uma pergunta mais direta ou envie novamente em alguns instantes.'
        : 'Não consegui responder agora. Verifique a conexão com a API e tente novamente.';

      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: errorText,
        },
      ]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  const selectedLavoura = lavouras.find((item) => item.id === selectedLavouraId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles-outline" size={22} color={colors.accentPrimary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>AgroSat AI</Text>
            <Text style={styles.subtitle}>
              {selectedLavoura ? `${selectedLavoura.nome} • ${selectedLavoura.tipo}` : 'Assistente agrícola'}
            </Text>
          </View>
          {loadingData && <ActivityIndicator size="small" color={colors.accentPrimary} />}
        </View>

        {lavouras.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
            {lavouras.map((lavoura) => (
              <TouchableOpacity
                key={lavoura.id}
                style={[styles.selectorChip, lavoura.id === selectedLavouraId && styles.selectorChipActive]}
                onPress={() => loadData(lavoura.id)}
              >
                <Text style={[styles.selectorText, lavoura.id === selectedLavouraId && styles.selectorTextActive]}>
                  {lavoura.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <ChatBubble key={message.id} role={message.role} text={message.text} />
          ))}
          {sending && (
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={colors.accentPrimary} />
              <Text style={styles.loadingText}>Analisando contexto...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.suggestions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {suggestions.map((suggestion) => (
              <ChatSuggestion
                key={suggestion}
                label={suggestion}
                onPress={() => sendMessage(suggestion)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Pergunte sobre sua lavoura..."
            placeholderTextColor={colors.textDim}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || sending}
          >
            <Ionicons name="send-outline" size={19} color="#ffffff" />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  selector: {
    maxHeight: 42,
    marginBottom: spacing.md,
  },
  selectorChip: {
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  selectorChipActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  selectorText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  selectorTextActive: {
    color: '#ffffff',
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  suggestions: {
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 96,
    color: colors.textPrimary,
    fontSize: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});
