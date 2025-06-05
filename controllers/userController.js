const userModel = require('../models/userModel');

const userController = {
async registerUser(req, res) {
    try {
        const {
            id_usuario, nombre1, nombre2, apellido1, apellido2,
            password, password2, fecha_nacimiento, correo,
            telefono, plan_id, pais, estado, ciudad, ocupacion
        } = req.body;

        console.log('req.body recibido en el controlador:', req.body);

        if (password !== password2) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
        }

        const userData = {
            id_usuario, nombre1, nombre2, apellido1, apellido2,
            password, fecha_nacimiento, correo,
            telefono, plan_id, pais, estado, ciudad, ocupacion
        };

        const idUsuario = await userModel.registerUser(userData);

        res.status(201).json({ message: 'Usuario creado con éxito', idUsuario });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    }
},

    async loginUser(req, res) {
        try {
            const { id_usuario, password } = req.body;

            const user = await userModel.loginUser(id_usuario, password);

            res.status(200).json({ message: 'Login exitoso', user });
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            res.status(401).json({ message: 'Usuario o contraseña incorrectos', error: error.message });
        }
    },

    async getUserPlan(req, res) {
        try {
            const { id_usuario } = req.params;

            const plan = await userModel.getUserPlan(id_usuario);

            if (!plan) {
                return res.status(404).json({ message: 'Plan no encontrado' });
            }

            res.status(200).json({ message: 'Plan obtenido con éxito', plan });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el plan del usuario', error: error.message });
        }
    },

    async makePayment(req, res) {
        try {
            const { id_usuario } = req.params;

            const payment = await userModel.makePayment(id_usuario);

            res.status(200).json({ message: 'Pago realizado exitosamente', payment });
        } catch (error) {
            console.error('Error al realizar el pago:', error);
            res.status(500).json({ message: 'Error al realizar el pago', error: error.message });
        }
    },

    async addFamilyMember(req, res) {
        try {
            const userData = req.body;

            const idFamiliar = await userModel.addFamilyMember(userData);

            res.status(201).json({ message: 'Familiar agregado con éxito', idFamiliar });
        } catch (error) {
            console.error('Error al agregar familiar:', error);
            res.status(500).json({ message: 'Error al agregar familiar', error: error.message });
        }
    },
    async getPlanes(req, res){
        try {
            const planes = await userModel.getPlanes();
            res.status(200).json({ message: 'Planes obtenidos con éxito', planes });
        } catch (error) {
            console.error('Error al obtener los planes:', error);
            res.status(500).json({ message: 'Error al obtener los planes', error: error.message });
        }
    },
    async getParentescos(req, res){
        try{
            const parentescos = await userModel.getParentescos();
            res.status(200).json({message: 'Parentescos obtenidos con éxito', parentescos});
        } catch(error){
            console.error('Error al obtener los planes: ')
            res.status(500).json({message: 'Error al obtener los parentescos', error: error.message});
        }
    },
    async getOcupaciones(req, res){
        try{
            const ocupaciones = await userModel.getOcupaciones();
            res.status(200).json({message:'Ocupaciones obtenidas con éxito', ocupaciones});
        } catch(err){
            console.error('Error al obtener las ocupaciones');
            res.status(500).json({message: 'Error al obtener las ocupaciones', error: error.message})
        }
    },
    async countFamilyMembers(req, res){
        try {
            const { id_usuario } = req.params;

            const count = await userModel.countFamilyMembers(id_usuario);

            res.status(200).json({ message: 'Cantidad de familiares obtenida con éxito', count });
        } catch (error) {
            console.error('Error al contar los familiares:', error);
            res.status(500).json({ message: 'Error al contar los familiares', error: error.message });
        }
        
    },
    async getUserInfo(req, res) {
        try {
            const { id_usuario } = req.params;

            const userInfo = await userModel.getUserInfo(id_usuario);

            if (!userInfo) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.status(200).json({ message: 'Información del usuario obtenida con éxito', userInfo });
        } catch (error) {
            console.error('Error al obtener la información del usuario:', error);
            res.status(500).json({ message: 'Error al obtener la información del usuario', error: error.message });
        }
    },
    async getFamilyMembers(req, res){
        try {
            const { id_usuario } = req.params;

            const familyMembers = await userModel.getFamilyMembers(id_usuario);

            if (!familyMembers || familyMembers.length === 0) {
                return res.status(404).json({ message: 'No se encontraron familiares' });
            }

            res.status(200).json({ message: 'Familiares obtenidos con éxito', familyMembers });
        } catch (error) {
            console.error('Error al obtener los familiares:', error);
            res.status(500).json({ message: 'Error al obtener los familiares', error: error.message });
        }
    },
    async updateUserInfo(req, res) {
        try {
            const { id_usuario } = req.params;
            const{campo, valor}= req.body;

            const updatedUser = await userModel.updateUserInfo(id_usuario, campo, valor);

            if (!updatedUser) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.status(200).json({ message: 'Información del usuario actualizada con éxito', updatedUser });
        } catch (error) {
            console.error('Error al actualizar la información del usuario:', error);
            res.status(500).json({ message: 'Error al actualizar la información del usuario', error: error.message });
        }
    },
    async updateFamilyMember(req, res){
        try {
            const { id_familiar } = req.params;
            const { campo, valor } = req.body;

            const updatedFamilyMember = await userModel.updateFamilyMember(id_familiar, campo, valor);

            if (!updatedFamilyMember) {
                return res.status(404).json({ message: 'Familiar no encontrado' });
            }

            res.status(200).json({ message: 'Información del familiar actualizada con éxito', updatedFamilyMember });
        } catch (error) {
            console.error('Error al actualizar la información del familiar:', error);
            res.status(500).json({ message: 'Error al actualizar la información del familiar', error: error.message });
        }
    },
    async deleteFamilyMember(req, res) {
        try {
            const { id_familiar } = req.params;

            const deletedFamilyMember = await userModel.deleteFamilyMember(id_familiar);

            if (!deletedFamilyMember) {
                return res.status(404).json({ message: 'Familiar no encontrado' });
            }

            res.status(200).json({ message: 'Familiar eliminado con éxito', deletedFamilyMember });
        } catch (error) {
            console.error('Error al eliminar el familiar:', error);
            res.status(500).json({ message: 'Error al eliminar el familiar', error: error.message });
        }
    },
    async makePaymentPendiente(req, res){
        try {
            const { id_usuario } = req.params;

            const payment = await userModel.makePayPendiente(id_usuario);

            res.status(200).json({ message: 'Pago pendiente realizado exitosamente', payment });
        } catch (error) {
            console.error('Error al realizar el pago pendiente:', error);
            res.status(500).json({ message: 'Error al realizar el pago pendiente', error: error.message });
        }
    },
    async payPendiente(req, res){
        try {
            const { id_usuario } = req.params;

            const payment = await userModel.PayPendiente(id_usuario);

            res.status(200).json({ message: 'Pago pendiente obtenido exitosamente', payment });
        } catch (error) {
            console.error('Error al obtener el pago pendiente:', error);
            res.status(500).json({ message: 'Error al obtener el pago pendiente', error: error.message });
        }
    },
    async getPaymentHistory(req, res){
        try {
            const { id_usuario } = req.params;

            const paymentHistory = await userModel.getPaymentHistory(id_usuario);

            if (!paymentHistory || paymentHistory.length === 0) {
                return res.status(404).json({ message: 'No se encontraron pagos' });
            }

            res.status(200).json({ message: 'Historial de pagos obtenido con éxito', paymentHistory });
        } catch (error) {
            console.error('Error al obtener el historial de pagos:', error);
            res.status(500).json({ message: 'Error al obtener el historial de pagos', error: error.message });
        }
    }

}

module.exports = userController;