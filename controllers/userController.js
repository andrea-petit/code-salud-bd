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

}

module.exports = userController;