const express = require("express");
const router = express.Router();

const { getDashboard } = require("./dashboard_controller");
const { validate } = require("../../middleware/auth_middleware");

router.get('/', validate, getDashboard);

module.exports = router;