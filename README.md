<div align="center">

<img src="docs/imagens/banner.svg" alt="Minha Jornada no Roblox" width="100%"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&pause=1200&color=E2231A&center=true&vCenter=true&width=620&lines=Jogando+desde+2017+%F0%9F%8E%AE;Cada+emblema+conta+uma+hist%C3%B3ria;Transformando+anos+de+jogo+em+dados+%F0%9F%93%8A" alt="Texto animado"/>

<br/>

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-E2231A?style=for-the-badge)
![SPTech](https://img.shields.io/badge/SPTech-2026-16181d?style=for-the-badge)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black)

</div>

---

## 🟥 Sobre o projeto

O **Roblox** é uma plataforma on-line em que os próprios usuários criam e publicam suas experiências (jogos). Além de jogar, as pessoas conversam, formam grupos e fazem amizades. Muitos jogadores passam anos construindo uma história ali, mas essa trajetória fica espalhada e se perde com o tempo.

O **Minha Jornada no Roblox** é um website que, a partir do ID de um jogador, busca dados públicos da plataforma (emblemas, jogos e histórico) e os transforma em uma **linha do tempo** e em **indicadores visuais**.

> 💭 Não é um produto comercial. É um estudo pessoal com utilidade real: ajudar um jogador a revisitar a própria jornada, descobrir quais jogos marcaram cada fase e entender como os seus gostos mudaram ao longo dos anos.

## 🟥 Motivação

Jogo Roblox desde **2017**. O jogo foi uma das partes mais aguardadas do meu dia, um lugar onde fiz amizades on-line e onde aprendi muito mais do que parece: o inglês, conversando com jogadores de outros países, além da criatividade e do raciocínio lógico. Escolhi o tema por representar uma parte importante da minha história.

## 🟥 Funcionalidades planejadas

- [ ] 🏠 Página inicial apresentando o projeto
- [ ] 🔐 Cadastro e login, com validação dos formulários em JavaScript
- [ ] 🆔 Vínculo do usuário a um ID do Roblox
- [ ] 🏅 Consulta de dados públicos do jogador (emblemas e jogos)
- [ ] 🕹️ Linha do tempo da trajetória na plataforma
- [ ] 📊 Dashboard com indicadores (emblemas por ano, jogos com mais conquistas, primeiro jogo registrado)

> [!NOTE]
> O uso de dados externos do Roblox depende da aprovação do professor e das configurações de privacidade de cada conta. Caso não seja possível, os dados serão cadastrados manualmente no site.

## 🟥 Tecnologias

| Camada | Tecnologia |
|:--|:--|
| 🎨 Front-end | HTML, CSS e JavaScript |
| ⚙️ Back-end | Node.js com Express (API) |
| 🗄️ Banco de dados | MySQL, em uma máquina virtual Linux |
| 📈 Gráficos | Chart.js |
| 🗂️ Organização | Trello e Git/GitHub |

<details>
<summary><b>📚 Disciplinas aplicadas</b> (clique para abrir)</summary>
<br/>

| Disciplina | Aplicação no projeto |
|:--|:--|
| Tecnologia da Informação | Documentação, Trello e versionamento com Git |
| Banco de Dados | Modelo lógico, relacionamentos e comandos SQL |
| Algoritmos | Variáveis, funções, condicionais, repetições e vetores |
| Arq. de Computadores e Matemática | Cálculos dos indicadores |
| Introdução aos Sistemas Operacionais | VM Linux hospedando o banco de dados |
| Pesquisa e Inovação | Contexto, planejamento, dashboard e indicadores |
| Socioemocional | Apresentação final do projeto |

</details>

## 🟥 Como executar

Precisa do [Node.js](https://nodejs.org/) instalado (versão 18 ou mais nova). Na pasta `api`:

```bash
cd api
npm install     # só na primeira vez (baixa o Express e o dotenv)
npm start
```

Depois abra **http://localhost:3000** no navegador.

> [!TIP]
> Também dá para abrir o `site/index.html` com dois cliques. Nesse caso o site funciona com **dados de exemplo**, porque sem o servidor não é possível buscar os dados do Roblox.

### Chave da API do Roblox (para emblemas e inventário)

Desde março de 2026, o Roblox só entrega a lista de emblemas e o inventário de um jogador para quem usa a API oficial (**Open Cloud**) com uma chave. Sem a chave, essas partes mostram dados de exemplo.

1. Entre em [create.roblox.com/dashboard/credentials](https://create.roblox.com/dashboard/credentials) com a sua conta e crie uma **API Key**.
2. Em **Access Permissions**, adicione o sistema **Inventory** (`inventory-item`) com permissão de **leitura**.
3. Em **Accepted IP Addresses**, coloque o IP do seu computador (ou `0.0.0.0/0` para aceitar qualquer um, só durante os testes).
4. Salve e copie a chave. Na pasta `api`, copie o arquivo `.env.exemplo` com o nome `.env` e cole a chave na linha `ROBLOX_API_KEY=`.
5. Reinicie o servidor (`Ctrl + C` e `npm start` de novo).

> [!WARNING]
> A chave é secreta, como uma senha. O arquivo `.env` está no `.gitignore` para nunca ir para o GitHub.

> [!NOTE]
> Para ver emblemas e inventário de **outros** jogadores, o inventário deles precisa estar público (Configurações > Privacidade > Quem pode ver meu inventário: Todos).

### Estrutura

```
api/        servidor Node.js com Express: app.js liga o servidor; src/routes, src/controllers
            e src/models fazem a ponte com a API do Roblox (como no Web Data Viz)
site/       páginas (HTML), estilos (css/), scripts (js/) e imagens (img/)
docs/       documentação e diário de prompts
```

### Páginas

| Página | O que mostra |
|:--|:--|
| `index.html` | Cadastro e login |
| `inicio.html` | Saudação, amigos, jogados recentemente (pelos emblemas) e favoritos |
| `historia.html` | Minha história no Roblox |
| `jogos.html` | Jogos que me marcaram |
| `perfil.html` | Perfil do Roblox (o meu ou de outro jogador com `?id=`) |
| `jogador.html` | Buscar jogador e comparar contas |
| `emblemas.html` | Linha do tempo, emblemas por jogo e os mais raros |
| `inventario.html` | Valor dos itens limitados (RAP) e custo do visual atual |
| `dashboard.html` | Indicadores da jornada, da conta e do quiz (Chart.js) |
| `quiz.html` / `minigame.html` | Quiz sobre Roblox e o minigame Obby Runner |



## 🟥 Cronograma

| Semana | Entrega | Status |
|:--:|:--|:--:|
| 1 | Início do projeto individual | ✅ |
| 2 | Tema definido, documentação e Git | ✅ |
| 3 | Início do site (página Home) | ✅ |
| 4 | Cadastro, login e for/vetor | ✅ |
| 5 | Dashboard | ✅ |
| 6 | Apresentação | ⏳ |

## 🟥 Uso de Inteligência Artificial

Assistentes de IA foram usados como apoio para tirar dúvidas, organizar ideias e revisar textos. Todo o uso está registrado no 📓 [Diário de Prompts](docs/diario-de-prompts.md).

---

<div align="center">

**Alexandre Estiven Pari Villarroel**

São Paulo Tech School · 2026

<sub>Projeto acadêmico sem vínculo com a Roblox Corporation. "Roblox" é uma marca registrada da Roblox Corporation.</sub>

</div>
