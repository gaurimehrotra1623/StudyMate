const express = require("express");
const router = express.Router();
const { getFriendship, addFriend, getExistingFriends, getAllUsersForSuggestions } = require("./friends_controllers");
const { validate } = require("../../middleware/auth_middleware");
router.post('/', validate, getFriendship);
router.post('/add', validate, addFriend);
router.get('/existing', validate, getExistingFriends);
router.get('/suggestions', validate, getAllUsersForSuggestions);
module.exports = router;