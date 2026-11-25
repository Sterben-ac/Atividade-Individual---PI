let express = require(`express`);
let router = express.Router();

let quizController = require(`../controllers/quizController`);

router.post(`/tentativas`, function (req, res) {
    quizController.salvar(req, res);
});

router.get(`/tentativas/:idUsuario`, function (req, res) {
    quizController.listar(req, res);
});

module.exports = router;
