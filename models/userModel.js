const db = require('../database/db');

const UserModel = {

    registerUser: (userData) => {
        return new Promise((resolve, reject) => {

            const { id_usuario, nombre1, nombre2, apellido1, apellido2, password, correo, telefono, fecha_nacimiento, pais, ciudad, estado, id_plan} = userData;

            const direccion_query = `SELECT id_direccion FROM direccion WHERE pais = ? AND ciudad = ? AND estado = ?`;
            db.get(direccion_query, [pais, ciudad, estado], function(err, row) {
                if (err) return reject (err);
                if (row)
                    const direccion_id = row.id_direccion;
                    const insert_user = `INSERT INTO usuarios (id_usuario, nombre1, nombre2, apellido1, apellido2, password, fecha_nacimiento, correo, telefono, plan_id, id_direccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    db.run(insert_user, [id_usuario, nombre1, nombre2, apellido1, apellido2, password, fecha_nacimiento, correo, telefono, id_plan, direccion_id], function(err) {
                        if (err) return reject(err);
                        resolve({ success: true, message: 'User registered successfully', userId: this.lastID });

                    });5
                else {
                    const pais_query = `SELECT id_pais FROM paises WHERE nombre = ?`;
                    db.get(pais_query, [pais], function(err, row) {
                        if (err) return reject (err);
                        if (row)
                            const pais_id = row.id_pais;
                        else {
                            const insert_pais = `INSERT INTO paises (nombre) VALUES (?)`;
                            db.run(insert_pais, [pais], function(err) {
                                if (err) return reject(err);
                                const pais_id = this.lastID;
                            });
                        }
                    });

                    const estado_query = `SELECT id_estado FROM estados WHERE nombre = ?`;
                    db.get(estado_query, [estado], function(err, row) {
                        if (err) return reject (err);
                        if (row)
                            const estado_id = row.id_estado;
                        else {
                            const insert_estado = `INSERT INTO estados (nombre) VALUES (?)`;
                            db.run(insert_estado, [estado], function(err) {
                                if (err) return reject(err);
                                const estado_id = this.lastID;
                            });
                        }
                    
                    const ciudad_query = `SELECT id_ciudad FROM ciudades WHERE nombre = ?`;
                    db.get(ciudad_query, [ciudad], function(err, row) {
                        if (err) return reject (err);
                        if (row)
                            const ciudad_id = row.id_ciudad;
                        else {
                            const insert_ciudad = `INSERT INTO ciudades (nombre) VALUES (?)`;
                            db.run(insert_ciudad, [ciudad], function(err) {
                                if (err) return reject(err);
                                const ciudad_id = this.lastID;
                            });
                        }
                    
                    const insert_direccion = `INSERT INTO direcciones (pais, estado, ciudad) VALUES (?, ?, ?)`;
                    db.run(insert_direccion, [pais_id, estado_id, ciudad_id], function(err) {
                        if (err) return reject (err);
                        const direccion_id = this.lastID;
                    })

                    
                    

                

        })
    }
}

module.exports = UserModel;

