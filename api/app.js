let path = require(`path`);

let express = require(`express`);

let PORTA_APP = process.env.APP_PORT || 3000;

let app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, `..`, `site`)));

app.listen(PORTA_APP, function () {
    console.log(`Sterben rodando em http://localhost:${PORTA_APP}`);
});
