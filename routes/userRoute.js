const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');


router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/plan/:id_usuario', userController.getUserPlan);
router.post('/payment/:id_usuario', userController.makePayment);
router.post('/addFamilyMember', userController.addFamilyMember);
router.get('/planes', userController.getPlanes);
router.get('/parentescos', userController.getParentescos);
router.get('/ocupaciones', userController.getOcupaciones);

module.exports = router;