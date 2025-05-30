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
    }
}

module.exports = userController;