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
- **Múltiplas Telas Funcionais (6+):** Fluxos dinâmicos construídos: Auth (Login/Cadastro), Lista de Lavouras, Dashboard Inteligente, Cadastro Espacial de Fazenda, Alertas NASA e Perfil/Sobre o App.
- **Integração CRUD:** Comunicação fluida via `Axios` para criar, ler, atualizar e deletar lavouras junto ao Backend Spring Boot.
- **Navegação com Expo Router:** Abordagem super moderna baseada no *File System*, combinando perfeitamente Stack Navigation (para sobreposição de fluxo de login) e Tabs Bottom Navigation (para a interface principal de navegação rápida).
- **Design System Premium:** Adoção de uma UI *Dark-Agriculture-Green* focada em conversão. Uso intenso de micro-interações, estados de carregamento elegantes (spinners), *glassmorphism*, fontes personalizadas do Google (Inter/Outfit) e adaptação inteligente e nativa ao *Dynamic Island* via `SafeAreaView`.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
Certifique-se de que o **Backend Java** já está em execução localmente na porta `8080`.

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

> **Importante:** Se você for testar o aplicativo no seu **Celular Físico**, é obrigatório alterar o arquivo `src/services/api.ts` e trocar a `baseURL` de `localhost` para o seu **IP local** (Ex: `192.168.1.10:8080`), pois o celular não entenderá o `localhost` do seu computador.

---

## 👨‍💻 Equipe Desenvolvedora
Entrega da **Global Solution — FIAP 2026**:

| Desenvolvedor | RM |
| --- | --- |
| **Davi Vasconcelos Souza** | `RM: 559906` |
| **Gustavo Dantas Oliveira** | `RM: 560685` |
| **Arthur Henrique Marino de Oliveira Borges** | `RM: 560820` |
| **Gustavo Alves Ramos** | `RM: 561055` |
