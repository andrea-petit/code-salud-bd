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


function getOcupacionIdByNombre(nombre) {
    return new Promise((resolve, reject) => {
        if (!nombre) return reject(new Error('El nombre de la ocupación es requerido'));
        
        const nombreNormalizado = nombre.trim().toLowerCase();
        
        const sql = `SELECT id_ocupacion FROM ocupaciones WHERE LOWER(TRIM(descripcion)) = ?`;
        db.get(sql, [nombreNormalizado], (err, row) => {
            if (err) return reject(err);
            if (row) {
                resolve(row.id_ocupacion);
            } else {
                reject(new Error('Ocupación no encontrada'));
            }
        });
    });
}

function getParentescoIdByNombre(nombre) {
    return new Promise((resolve, reject) => {
        if (!nombre) return reject(new Error('El nombre del parentesco es requerido'));
        
        const nombreNormalizado = nombre.trim().toLowerCase();
        
        const sql = `SELECT id_parentesco FROM parentescos WHERE LOWER(TRIM(descripcion)) = ?`;
        db.get(sql, [nombreNormalizado], (err, row) => {
            if (err) return reject(err);
            if (row) {
                resolve(row.id_parentesco);
            } else {
                reject(new Error('Parentesco no encontrado'));
            }
        });
    });
}

const userModel = {

    registerUser: (userData) => {
        console.log('userData recibido en registerUser:', userData);
        return new Promise((resolve, reject) => {
            const {
                id_usuario, nombre1, nombre2, apellido1, apellido2,
                password, fecha_nacimiento, correo, telefono,
                plan_id, pais, estado, ciudad, ocupacion
            } = userData;

            Promise.all([
                verificarDireccion(pais, estado, ciudad),
                getOcupacionIdByNombre(ocupacion)
            ])
            .then(([id_direccion, id_ocupacion]) => {
                const sql = `INSERT INTO usuarios (id_usuario, nombre1, nombre2, apellido1, apellido2, password, fecha_nacimiento, correo, telefono, plan_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const insertarDireccion = `INSERT INTO usuarios_direccion (id_usuario, id_direccion) VALUES (?, ?)`;
                const insertarOcupacion = `INSERT INTO usuarios_ocupacion (id_usuario, id_ocupacion) VALUES (?, ?)`;

                db.run(sql, [id_usuario, nombre1, nombre2, apellido1, apellido2, password, fecha_nacimiento, correo, telefono, plan_id], function(err) {
                    if (err) return reject(err);

                    db.run(insertarDireccion, [id_usuario, id_direccion], function(err) {
                        if (err) return reject(err);
                        db.run(insertarOcupacion, [id_usuario, id_ocupacion], function(err) {
                            if (err) return reject(err);
                            resolve(id_usuario);
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

    makePayment: function(id_usuario) {
        return new Promise((resolve, reject) => {
            userModel.getUserPlan(id_usuario)
                .then(plan => {
                    const sql = `INSERT INTO pagos (id_usuario, monto, fecha, estado) VALUES (?, ?, datetime('now'), ?)`;
                    db.run(sql, [id_usuario, plan.precio_mensual, "pagado"], function(err) {
                        if (err) return reject(err);
                        resolve({message: 'Pago realizado exitosamente', paymentId: this.lastID});
                    });
                })
                .catch(err => reject(err));
        });
    },

    addFamilyMember: (userData) => {
        return new Promise((resolve, reject) => {
            const { id_familiar, id_usuario, nombre1, nombre2, apellido1, apellido2, correo, telefono, pais, estado, ciudad, parentesco, ocupacion } = userData;

            Promise.all([
                verificarDireccion(pais, estado, ciudad),
                getParentescoIdByNombre(parentesco),
                getOcupacionIdByNombre(ocupacion)
            ])
            .then(([id_direccion, id_parentesco, id_ocupacion]) => {
                
                const sql = `INSERT INTO familiares (id_familiar, id_usuario, nombre1, nombre2, apellido1, apellido2, correo, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                db.run(sql, [id_familiar, id_usuario, nombre1, nombre2, apellido1, apellido2, correo, telefono], function(err) {
                    if (err) return reject(err);
                    const id_familiar = this.lastID;

                    
                    const insertarFamiliarDireccion = `INSERT INTO familiares_direccion (id_familiar, id_direccion) VALUES (?, ?)`;
                    db.run(insertarFamiliarDireccion, [id_familiar, id_direccion], function(err) {
                        if (err) return reject(err);

                        const insertarOcupacion = `INSERT INTO familiares_ocupacion (id_familiar, id_ocupacion) VALUES (?, ?)`;
                        db.run(insertarOcupacion, [id_familiar, id_ocupacion], function(err) {
                            if (err) return reject(err);

                            const insertarParentesco = `INSERT INTO familiares_parentesco (id_familiar, id_parentesco) VALUES (?, ?)`;
                            db.run(insertarParentesco, [id_familiar, id_parentesco], function(err) {
                                if (err) return reject(err);
                                resolve({ message: 'Familiar agregado exitosamente', familyMemberId: id_familiar });
                            });
                        });
                    });
                });
            })
            .catch(err => reject(err));
        });
    },

    getPlanes: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM planes`;
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
}

module.exports = userModel;

