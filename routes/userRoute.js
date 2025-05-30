const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');


router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/plan/:id_usuario', userController.getUserPlan);
router.post('/payment/:id_usuario', userController.makePayment);
router.post('/addFamilyMember', userController.addFamilyMember);

module.exports = router;