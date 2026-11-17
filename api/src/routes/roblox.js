let express = require(`express`);
let router = express.Router();

let robloxController = require(`../controllers/robloxController`);

router.get(`/perfil/:id`, function (req, res) {
    robloxController.perfil(req, res);
});

router.get(`/amigos/:id`, function (req, res) {
    robloxController.amigos(req, res);
});

router.get(`/favoritos/:id`, function (req, res) {
    robloxController.favoritos(req, res);
});

router.get(`/buscar`, function (req, res) {
    robloxController.buscar(req, res);
});

module.exports = router;
