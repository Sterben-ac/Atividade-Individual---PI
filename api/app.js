let path = require(`path`);
require(`dotenv`).config({ path: path.join(__dirname, `.env`) });

let express = require(`express`);

let PORTA_APP = process.env.APP_PORT || 3000;

let app = express();

let usuarioRouter = require(`./src/routes/usuarios`);
let robloxRouter = require(`./src/routes/roblox`);

app.use(express.json());
app.use(express.static(path.join(__dirname, `..`, `site`)));

app.use(`/usuarios`, usuarioRouter);
app.use(`/roblox`, robloxRouter);

if (!process.env.ROBLOX_API_KEY) {
    console.log(`AVISO: sem ROBLOX_API_KEY no arquivo .env. Emblemas e inventário vão usar os dados de exemplo.`);
}

app.listen(PORTA_APP, function () {
    console.log(`Sterben rodando em http://localhost:${PORTA_APP}`);
});
