const db= require('../database/db');

const UserModel = {
    registerUser: (userData) => {
        return new Promise((resolve, reject) => {
            const { id_usuario, nombre1, nombre2, apellido1, apellido2, password, fecha_nacimiento, email, telefono, direccion } = userData;
            }

}

