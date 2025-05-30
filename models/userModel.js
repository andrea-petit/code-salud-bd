const db = require('../database/db');

function verificarDireccion(pais, estado, ciudad){
    return new Promise((resolve, reject) => {
        const sql = `SELECT id_direccion FROM direcciones WHERE pais = ? AND estado = ? AND ciudad = ?`;
        db.get(sql, [pais, estado, ciudad], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                resolve(row.id_direccion);
            } else {
                verificarPais(pais, estado, ciudad)
                    .then(idDireccion => resolve(idDireccion))
                    .catch(err => reject(err));
            }
        });
    });

}

function verificarPais(pais, estado, ciudad) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM paises WHERE nombre = ?`;
        db.get(sql, [pais], (err, row) => {
            if (err) return reject(err);
            if (row){
                id_pais = row.id_pais;
                verificarEstado(id_pais, estado, ciudad)
                    .then(idDireccion => resolve(idDireccion))
                    .catch(err => reject(err));
            }
            else {
                const insertSql = `INSERT INTO paises (nombre) VALUES (?)`;
                db.run(insertSql, [pais], function(err) {
                    if (err) return reject(err);
                    verificarEstado(this.lastID, estado, ciudad)
                        .then(idDireccion => resolve(idDireccion))
                        .catch(err => reject(err));
                });
            }
        })


    })
}

function verificarEstado(id_pais, estado, ciudad) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM estados WHERE nombre = ?`;
        db.get(sql, [estado], (err, row) => {
            if (err) return reject(err);
            if (row){
                id_estado = row.id_estado;
                verificarCiudad(id_pais, id_estado, ciudad)
                    .then(idDireccion => resolve(idDireccion))
                    .catch(err => reject(err));
            }
            else {
                const insertSql = `INSERT INTO estados (nombre) VALUES ( ?)`;
                db.run(insertSql, [estado], function(err) {
                    if (err) return reject(err);
                    verificarCiudad(id_pais, this.lastID, ciudad)
                        .then(idDireccion => resolve(idDireccion))
                        .catch(err => reject(err));
                });
            }
        })
    })
}

function verificarCiudad(id_pais, id_estado, ciudad) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ciudades WHERE nombre = ?`;
        db.get(sql, [ciudad], (err, row) => {
            if (err) return reject(err);
            if (row) {
                
                crearDireccion(id_pais, id_estado, row.id_ciudad)
                    .then(idDireccion => resolve(idDireccion))
                    .catch(err => reject(err));
            } else {
                
                const insertSql = `INSERT INTO ciudades (nombre) VALUES  (?)`;
                db.run(insertSql, [ciudad], function(err) {
                    if (err) return reject(err);
                    crearDireccion(id_pais, id_estado, this.lastID)
                        .then(idDireccion => resolve(idDireccion))
                        .catch(err => reject(err));
                });
            }
        });
    });
}

function crearDireccion(pais, estado, ciudad) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO direcciones (pais, estado, ciudad) VALUES (?, ?, ?)`;
        db.run(sql, [pais, estado, ciudad], function(err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
}

const userModel = {

    registerUser: (userData) => {
        return new Promise((resolve, reject) => {
            const {id_usuario, nombre1, nombre2, apellido1, apellido2, password, fecha_nacimiento, correo, telefono, plan_id, pais, estado, ciudad, id_ocupacion} = userData;
            verificarDireccion(pais, estado, ciudad)
                .then(id_direccion => {
                    const sql = `INSERT INTO usuarios (id_usuario, nombre1, nombre2, apellido1, apellido2, password, fecha_nacimiento, correo, telefono, plan_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    db.run(sql, [id_usuario, nombre1, nombre2, apellido1, apellido2, password, fecha_nacimiento, correo, telefono, plan_id], function(err) {
                        if (err) return reject(err);
                        const userId = this.lastID;
                        const insertarDireccion = `INSERT INTO usuarios_direccion (id_usuario, id_direccion) VALUES (?, ?)`;
                        db.run(insertarDireccion, [userId, id_direccion], function(err) {
                            if (err) return reject(err);
                            
                            const insertarOcupacion = `INSERT INTO usuarios_ocupacion (id_usuario, id_ocupacion) VALUES (?, ?)`;
                            db.run(insertarOcupacion, [userId, id_ocupacion], function(err) {
                                if (err) return reject(err);
                                resolve(userId);
                            });
                        });
                    });
                })
                .catch(err => reject(err));
            
        })
    },

    loginUser: (id_usuario, password) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM usuarios WHERE id_usuario = ? AND password = ?`;
            db.get(sql, [id_usuario, password], (err, row) => {
                if (err) return reject(err);
                if (row) {
                    resolve(row);
                } else {
                    reject(new Error('Usuario o contraseña incorrectos'));
                }
            });
        });
    },

    getUserPlan: (id_usuario) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT p.capacidad_total, p.max_no_directos, p.precio_mensual FROM usuarios u JOIN planes p ON u.plan_id = p.id WHERE u.id_usuario = ?`;
            db.get(sql, [id_usuario], (err, row) => {
                if (err) return reject(err);
                if (row) {
                    resolve(row);
                } else {
                    reject(new Error('Plan no encontrado para el usuario'));
                }
            });
        });
    },

    makePayment: (id_usuario) => {
        return new Promise((resolve, reject) => {
            this.getUserPlan(id_usuario)
                .then(plan => {
                    const sql = `INSERT INTO pagos (id_usuario, fecha_pago, monto) VALUES (?, datetime('now'), ?)`;
                    db.run(sql, [id_usuario, plan.precio_mensual], function(err) {
                        if (err) return reject(err);
                        resolve({message: 'Pago realizado exitosamente', paymentId: this.lastID});
                    });
                })
                .catch(err => reject(err));
        })
    },

    addFamilyMember: (userData) => {
        return new Promise((resolve, reject) => {
            const {id_usuario, nombre1, nombre2, apellido1, apellido2, correo, telefono, pais, estado, ciudad, id_parentesco, id_ocupacion} = userData;
            verificarDireccion(pais, estado, ciudad)
                .then(id_direccion => {
                    const sql = `INSERT INTO familiares (id_usuario, nombre1, nombre2, apellido1, apellido2, correo, telefono, id_direccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                    db.run(sql, [id_usuario, nombre1, nombre2, apellido1, apellido2, correo, telefono, id_direccion], function(err) {
                        if (err) return reject(err);
                        const id_familiar = this.lastID;
                        const insertarParentesco = `INSERT INTO familiares_parentesco (id_familiar, id_parentesco) VALUES (?, ?)`;
                        db.run(insertarParentesco, [id_familiar, id_parentesco], function(err) {
                            if (err) return reject(err);
                            const insertarOcupacion = `INSERT INTO familiares_ocupacion (id_familiar, id_ocupacion) VALUES (?, ?)`;
                            db.run(insertarOcupacion, [id_familiar, id_ocupacion], function(err) {
                                if (err) return reject(err);
                                resolve({message: 'Familiar agregado exitosamente', familyMemberId: id_familiar});
                            });
                        });
                    });
                })
                .catch(err => reject(err));
        });
    }

}

module.exports = userModel;

