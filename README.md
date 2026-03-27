# Escola Check-in 📋

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![QR Code](https://img.shields.io/badge/QR%20Code-000000?style=for-the-badge&logo=qrcode&logoColor=white)

## 📋 Sobre o Projeto

Sistema completo de **check-in de professores por QR Code** desenvolvido para escolas públicas, com foco em agilidade, praticidade e rastreabilidade da presença docente. Desenvolvido como ferramenta de gestão escolar para a **Escola Estadual Joaquim Diégues**, em Viçosa, Alagoas.

Este projeto foi concebido com foco em **usabilidade**, **responsividade** e **simplicidade de operação**, permitindo que professores registrem sua presença de forma rápida e eficiente via leitura de QR Code, dispensando processos manuais em papel.

## ✨ Funcionalidades

### 📱 Check-in por QR Code

- **Leitura de QR Code**: Scanner integrado via câmera do dispositivo
- **Check-in Instantâneo**: Registro de presença em tempo real
- **Validação de Horário**: Controle de pontualidade automático
- **Identificação do Professor**: Associação automática ao QR Code individual

### 🎨 Interface e Design

- **Design Responsivo**: Adapta-se perfeitamente a smartphones, tablets e desktops
- **Tema Escuro/Claro**: Alternância entre modos visual claro e escuro
- **Animações Suaves**: Transições e feedbacks visuais intuitivos
- **Tipografia Otimizada**: Fontes legíveis e hierarquia visual clara

### 🔐 Gestão e Controle

- **Painel Administrativo**: Visão geral de presenças por turno e dia
- **Histórico de Registros**: Consulta de check-ins anteriores
- **Relatórios de Frequência**: Exportação e visualização de dados
- **Cadastro de Professores**: Gerenciamento do quadro docente

### ♿ Acessibilidade

- **Semântica HTML**: Estrutura acessível com papéis e regiões bem definidos
- **Navegação por Teclado**: Suporte completo à navegação sem mouse
- **ARIA Labels**: Rótulos para leitores de tela
- **Contraste de Cores**: Cores com contraste adequado para leitura confortável

### 📊 Dados e Performance

- **Registro em Banco de Dados**: Persistência segura dos dados de presença
- **API RESTful**: Backend robusto para comunicação com o frontend
- **Carregamento Otimizado**: Performance rápida mesmo em redes lentas
- **Compatibilidade**: Funciona nos principais navegadores modernos

## 🗺️ Fluxo do Sistema

### Para o Professor

1. **Recebe QR Code individual** — gerado e distribuído pela coordenação
2. **Acessa o sistema** — via link no smartphone ou computador da escola
3. **Aponta a câmera** — para o QR Code impresso no crachá ou papel
4. **Confirma presença** — check-in registrado instantaneamente
5. **Recebe feedback visual** — confirmação na tela com horário registrado

### Para a Gestão

1. **Acessa o painel admin** — com login e senha seguros
2. **Visualiza presenças** — em tempo real por turno e disciplina
3. **Consulta histórico** — filtrado por professor, data ou turno
4. **Gera relatórios** — exportáveis para uso em documentos oficiais

## 🚀 Tecnologias Utilizadas

### Frontend

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilos modernos com variáveis CSS, Flexbox e Grid Layout
- **JavaScript ES6+**: Lógica de interação e comunicação com API
- **Biblioteca QR Scanner**: Leitura de QR Code via câmera do dispositivo

### Backend

- **Node.js / Express** (ou equivalente): Servidor da aplicação e rotas da API
- **Banco de Dados Relacional**: Persistência dos registros de check-in
- **Autenticação JWT**: Segurança no acesso ao painel administrativo
- **CORS configurado**: Comunicação segura entre frontend e backend

### Infraestrutura

- **Deploy na nuvem**: Hospedagem via plataforma cloud (Railway / Render)
- **Supabase / PostgreSQL**: Banco de dados gerenciado na nuvem
- **HTTPS**: Comunicação segura e necessária para acesso à câmera

## 💻 Estrutura do Projeto

```
escola-checkin/
│
├── index.html           # Página principal — interface de check-in
├── README.md            # Documentação do projeto
├── .gitignore           # Arquivos ignorados pelo git
│
├── backend/             # Servidor Node.js e lógica de negócio
│   ├── server.js        # Ponto de entrada do servidor
│   ├── routes/          # Rotas da API REST
│   ├── controllers/     # Controladores de lógica
│   ├── models/          # Modelos de dados
│   └── config/          # Configurações (banco, env, etc.)
│
├── css/
│   └── style.css        # Estilos principais
│
└── js/
    └── script.js        # JavaScript principal (scanner e UI)
```

## 🚀 Como Usar

### Acesso Online

O projeto está (ou estará) disponível em: `https://escola-checkin.vercel.app`

> Acesso ao painel administrativo requer credenciais da coordenação escolar.

### Instalação Local

1. **Clone o repositório**:

```bash
git clone https://github.com/alexandrehenriqueventura/escola-checkin.git
```

2. **Navegue para o diretório**:

```bash
cd escola-checkin
```

3. **Configure as variáveis de ambiente**:

```bash
cp .env.example .env
# Edite o .env com suas credenciais de banco de dados
```

4. **Instale as dependências do backend**:

```bash
cd backend
npm install
```

5. **Inicie o servidor**:

```bash
npm start
```

6. **Abra o frontend** — sirva o `index.html` em um servidor local com HTTPS (necessário para câmera):

```bash
# Com Node.js (serve com HTTPS)
npx serve . --ssl

# Ou via extensão Live Server (VS Code) com HTTPS habilitado
```

### Geração dos QR Codes

Cada professor recebe um QR Code único gerado a partir do seu ID no sistema. Acesse o painel administrativo → Professores → Gerar QR Code para imprimir os crachás.

## 🔐 Segurança

- **Autenticação obrigatória** para o painel administrativo
- **QR Codes únicos** — cada professor tem um código individual
- **Registros imutáveis** — logs de check-in não podem ser editados retroativamente
- **HTTPS obrigatório** — proteção dos dados em trânsito
- **Variáveis de ambiente** — dados sensíveis nunca no código-fonte

## 🔄 Atualizações Futuras

### Planejadas

- 📊 Dashboard com gráficos de frequência mensal
- 📧 Notificações por e-mail para a coordenação em caso de ausência
- 📄 Exportação de relatórios em PDF e Excel
- 📱 PWA — instalável como aplicativo nativo no smartphone
- 🔔 Alertas de atraso configuráveis por turno
- 🗓️ Integração com calendário escolar
- 🌐 Suporte a múltiplas unidades escolares
- 🧾 Assinatura digital do registro de presença

## 📄 Licença

Este projeto não possui uma licença específica definida. É uma ferramenta de gestão educacional desenvolvida para uso institucional.

## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Tipos de Contribuição

- 🐛 Correção de bugs
- ✨ Novas funcionalidades
- 📝 Melhoria da documentação
- 🎨 Melhorias de design
- ♿ Melhorias de acessibilidade
- 🔒 Melhorias de segurança
- ⚡ Otimizações de performance

## 📞 Contato

**Alexandre Henrique Ventura**

- Email: alexandrehenrique.ventura@gmail.com
- GitHub: [@alexandrehenriqueventura](https://github.com/alexandrehenriqueventura)

**Instituição**

- Escola Estadual Joaquim Diégues
- Viçosa, Alagoas, Brasil

## 🙏 Agradecimentos

- **Escola Estadual Joaquim Diégues**: Pelo apoio institucional e necessidade que inspirou o projeto
- **Equipe docente**: Pelo feedback durante o desenvolvimento
- **Comunidade Open Source**: Pelas ferramentas e bibliotecas utilizadas

---

**Desenvolvido com ❤️ para simplificar a gestão escolar pública**
