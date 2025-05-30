const userModel = require('../models/userModel');

const userController = {
    async createUser(req, res) {
        try {
            const { nombre1, nombre2, apellido1, apellido2, correo, telefono, ocupacion, parentesco, pais, estado, ciudad, password, password2 } = req.body;

            if (password !== password2) {
                return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
            }

            const idDireccion = await userModel.verificarEstado(pais, estado, ciudad);

            const idUsuario = await userModel.createUser(nombre1, nombre2, apellido1, apellido2, correo, telefono, ocupacion, parentesco, idDireccion, password);

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
    }
}

module.exports = userController;