const express = require("express");
const router = express.Router();
const { 
  getFriendship, 
  addFriend, 
  getExistingFriends, 
  getAllUsersForSuggestions,
  removeFriend
} = require("./friends_controllers");
const { validate } = require("../../middleware/auth_middleware");

router.post('/', validate, getFriendship);
router.post('/add', validate, addFriend);
router.get('/existing', validate, getExistingFriends);
router.get('/suggestions', validate, getAllUsersForSuggestions);
router.delete('/remove', validate, removeFriend);

module.exports = router;