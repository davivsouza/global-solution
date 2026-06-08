import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/colors';

export default function LavourasLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bgPrimary,
        },
        headerTitleStyle: {
          color: colors.textPrimary,
          fontWeight: '700',
          fontSize: 18,
        },
        headerTintColor: colors.accentPrimary,
        contentStyle: { backgroundColor: colors.bgPrimary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Minhas Lavouras' }} />
      <Stack.Screen name="create" options={{ title: 'Nova Lavoura' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhe da Lavoura' }} />
    </Stack>
  );
}
