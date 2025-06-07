const express = require('express');
const router = express.Router();
const autenticacion = require('../middleware/auth');

const userController = require('../controllers/userController');


router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/plan/:id_usuario', userController.getUserPlan);
router.post('/payment/:id_usuario', userController.makePayment);
router.post('/addFamilyMember', userController.addFamilyMember);
router.get('/planes', userController.getPlanes);
router.get('/parentescos', userController.getParentescos);
router.get('/ocupaciones', userController.getOcupaciones);
router.get('/userInfo', userController.getUserInfo);
router.get('/familyMembers/:id_usuario', userController.getFamilyMembers);
router.post('/updateUserInfo/:id_usuario', userController.updateUserInfo);
router.post('/updateFamilyMember/:id_usuario', userController.updateFamilyMember);
router.post('/deleteFamilyMember/:id_usuario', userController.deleteFamilyMember);
router.post('/makePaymentPendiente/:id_usuario', userController.makePaymentPendiente);
router.post('/payPendiente/:id_usuario', userController.payPendiente);
router.get('/getPaymentHistory/:id_usuario', userController.getPaymentHistory);





module.exports = router;