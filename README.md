<h1 align="center">🌱 AgroSat Mobile — App do Agricultor (React Native)</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

O **AgroSat Mobile** é o aplicativo construído para o usuário final, focado em trazer uma experiência fluida, moderna e inteligente para a gestão agrícola.

Este projeto representa a entrega de **Mobile Application Development (MAD)** para a Global Solution da FIAP.

---

👉 **[Assistir ao Vídeo do Projeto no YouTube](https://youtu.be/Ml0gHfLxjiI)**

---

## 📱 Arquitetura Mobile (React Native + Expo)

O App Mobile moderno e altamente interativo preenche 100% dos requisitos de entrega de MAD.

- **Autenticação Segura:** Telas protegidas de Login/Cadastro manipulando **JWT (Bearer Tokens)** guardados sob criptografia local usando `expo-secure-store` e gerenciamento global com a **Context API**.
- **Múltiplas Telas Funcionais (6+):** Fluxos dinâmicos construídos: Auth (Login/Cadastro), Lista de Lavouras, Dashboard Inteligente, Cadastro Espacial de Fazenda, Alertas NASA/AgroSat e Perfil/Sobre o App.
- **Integração CRUD:** Comunicação fluida via `Axios` para criar, ler, atualizar e deletar lavouras junto ao Backend Spring Boot.
- **Painel de Alertas de Satélite e AgroSat:** Tela unificada que integra:
  * **Alertas Globais da NASA EONET:** Incêndios florestais, tempestades, inundações detectados por satélites da NASA, filtrados por distância em relação às suas fazendas (raio de 500km, 1500km, 3000km, etc.).
  * **Alertas Locais de Lavouras (AgroMonitoring):** Apresenta dados reais de **Estresse Vegetativo (NDVI)** e barra de progresso com a porcentagem de **Umidade do Solo**, avisando quando as plantas entram em zona de perigo.
- **Navegação com Expo Router:** Abordagem baseada no *File System*, combinando perfeitamente Stack Navigation (para sobreposição de fluxo de login) e Tabs Bottom Navigation (para a interface principal de navegação rápida).
- **Design System Premium:** Adoção de uma UI *Dark-Agriculture-Green* focada em conversão. Uso intenso de micro-interações, estados de carregamento elegantes, *glassmorphism*, fontes personalizadas do Google (Inter/Outfit) e adaptação nativa ao *Dynamic Island* via `SafeAreaView`.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
Certifique-se de que o **Backend Java** já está em execução localmente na porta `8080`.

### Configurando a Conexão com o Backend
Antes de iniciar, crie ou configure o arquivo `.env` na raiz do diretório `mobile/`:
```env
EXPO_PUBLIC_API_URL=http://<IP_DA_SUA_MAQUINA>:8080/api
```
> **Atenção:** Se for testar no **Simulador iOS**, pode usar `http://localhost:8080/api`. Se for testar em **Emulador Android**, use `http://10.0.2.2:8080/api`. Caso utilize o **Celular Físico (Expo Go)**, é obrigatório inserir o IP local do seu computador (ex: `http://192.168.15.74:8080/api`), garantindo que ambos os dispositivos estejam no mesmo Wi-Fi.

### Rodando o App
1. Instale as dependências:
```bash
npm install
```

2. Inicie o Metro Bundler:
```bash
npx expo start
```

3. Pressione `i` para abrir no simulador iOS, `a` para emulador Android, ou use o aplicativo **Expo Go** no celular escaneando o QR Code.

---

## 👨‍💻 Equipe Desenvolvedora
Entrega da **Global Solution — FIAP 2026**:

| Desenvolvedor | RM |
| --- | --- |
| **Davi Vasconcelos Souza** | `RM: 559906` |
| **Gustavo Dantas Oliveira** | `RM: 560685` |
| **Arthur Henrique Marino de Oliveira Borges** | `RM: 560820` |
| **Gustavo Alves Ramos** | `RM: 561055` |
