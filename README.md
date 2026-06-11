<h1 align="center">AgroSat Mobile — App do Agricultor</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

O **AgroSat Mobile** é o aplicativo do usuário final da solução AgroSat. Ele permite cadastrar lavouras georreferenciadas, visualizar análises agroclimáticas, acompanhar alertas e conversar com um assistente agrícola conectado ao contexto da propriedade.


---

**Vídeo do projeto:** [YouTube](https://youtu.be/pc6LMFKMGWY)

---

## Arquitetura do App

O mobile é a camada de experiência da arquitetura AgroSat. Ele não consulta NASA, AgroMonitoring ou Gemini diretamente: toda integração externa passa pelo backend Java, mantendo as chaves e regras de negócio fora do aplicativo.

Fluxo principal:

1. O usuário faz login/cadastro no app.
2. O app guarda o JWT com `expo-secure-store`.
3. As telas autenticadas chamam a API Spring Boot em `/api`.
4. O backend cruza dados da lavoura com NASA POWER, AgroMonitoring e Spring AI.
5. O app exibe análise climática, umidade do solo, NDVI, alertas e respostas do assistente agrícola.

## Funcionalidades

- **Autenticação com JWT:** login, cadastro e sessão persistida de forma segura no dispositivo.
- **CRUD de lavouras:** criação, listagem, edição, exclusão e detalhe de áreas produtivas com latitude e longitude.
- **Dashboard agrícola:** resumo das lavouras cadastradas e atalhos para análise.
- **Análise climática:** consumo de de enpoints para exibir clima, solo e NDVI.
- **Alertas:** painel de avisos gerados pelo backend para seca grave e estresse vegetativo.
- **Chat agrícola:** conversa com o agente AI usando o contexto da lavoura e os dados climáticos disponíveis.
- **Navegação com Expo Router:** rotas por arquivos, tabs principais e stack de autenticação.

## Stack

- React Native
- Expo SDK 56
- Expo Router
- TypeScript
- Axios
- Expo Secure Store
- React Context API

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz.

```env
EXPO_PUBLIC_API_URL=http://<IP_DA_SUA_MAQUINA>:8080/api
```

Use o endereço conforme o ambiente de teste:

- **Simulador iOS:** `http://localhost:8080/api`
- **Emulador Android:** `http://10.0.2.2:8080/api`
- **Celular físico com Expo Go:** `http://SEU_IP_LOCAL:8080/api`

O backend precisa estar rodando antes de abrir as telas autenticadas.

## Como Executar

Instale as dependências:

```bash
npm install
```

Inicie o Expo:

```bash
npx expo start
```

Depois, abra no simulador iOS, emulador Android ou escaneie o QR Code com o Expo Go.

## Integração com o Backend

O app espera a API Java disponível em `EXPO_PUBLIC_API_URL`. Os principais recursos consumidos são:

| Recurso | Endpoint |
| --- | --- |
| Autenticação | `/api/auth/login`, `/api/auth/register` |
| Lavouras | `/api/lavouras` |
| Análise climática | `/api/climate/analyze/{lavouraId}` |
| Alertas | `/api/alertas` |
| Chat agrícola | `/api/ai/chat` |

## Equipe Desenvolvedora

Entrega da **Global Solution — FIAP 2026**:

| Desenvolvedor | RM |
| --- | --- |
| **Davi Vasconcelos Souza** | `RM: 559906` |
| **Gustavo Dantas Oliveira** | `RM: 560685` |
| **Arthur Henrique Marino de Oliveira Borges** | `RM: 560820` |
| **Gustavo Alves Ramos** | `RM: 561055` |
