const db = require('../database/db');

const UserModel = {

    registerUser: (userData) => {
        return new Promise((resolve, reject) => {
            
            const { id_usuario, nombre1, nombre2, apellido1, apellido2, password, correo, telefono, fecha_nacimiento, pais, ciudad, estado, id_plan} = userData;

            const direccion 
        })
    }
}

module.exports = UserModel;

