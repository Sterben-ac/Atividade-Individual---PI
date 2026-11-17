let express = require(`express`);
let router = express.Router();

let robloxController = require(`../controllers/robloxController`);

router.get(`/perfil/:id`, function (req, res) {
    robloxController.perfil(req, res);
});

module.exports = router;
