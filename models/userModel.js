const { get } = require('http');
const db = require('../database/db');

function verificarDireccion(paisNombre, estadoNombre, ciudadNombre) {
    return new Promise((resolve, reject) => {
        verificarPais(paisNombre, estadoNombre, ciudadNombre)
            .then(({ id_pais, id_estado, id_ciudad }) => {
                const sql = `SELECT id_direccion FROM direcciones WHERE pais = ? AND estado = ? AND ciudad = ?`;
                db.get(sql, [id_pais, id_estado, id_ciudad], (err, row) => {
                    if (err) return reject(err);
                    if (row) {
                        resolve(row.id_direccion);
                    } else {
                        crearDireccion(id_pais, id_estado, id_ciudad)
                            .then(id => resolve(id))
                            .catch(err => reject(err));
                    }
                });
            })
            .catch(err => reject(err));
    });
}

function verificarPais(nombrePais, nombreEstado, nombreCiudad) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id_pais FROM paises WHERE nombre = ?`;
        db.get(sql, [nombrePais], (err, row) => {
            if (err) return reject(err);
            if (row) {
                verificarEstado(row.id_pais, nombreEstado, nombreCiudad)
                    .then(data => resolve(data))
                    .catch(err => reject(err));
            } else {
                const insertSql = `INSERT INTO paises (nombre) VALUES (?)`;
                db.run(insertSql, [nombrePais], function(err) {
                    if (err) return reject(err);
                    verificarEstado(this.lastID, nombreEstado, nombreCiudad)
                        .then(data => resolve(data))
                        .catch(err => reject(err));
                });
            }
        });
    });
}

function verificarEstado(id_pais, nombreEstado, nombreCiudad) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id_estado FROM estados WHERE nombre = ?`;
        db.get(sql, [nombreEstado], (err, row) => {
            if (err) return reject(err);
            if (row) {
                verificarCiudad(id_pais, row.id_estado, nombreCiudad)
                    .then(data => resolve(data))
                    .catch(err => reject(err));
            } else {
                const insertSql = `INSERT INTO estados (nombre) VALUES (?)`;
                db.run(insertSql, [nombreEstado], function(err) {
                    if (err) return reject(err);
                    verificarCiudad(id_pais, this.lastID, nombreCiudad)
                        .then(data => resolve(data))
                        .catch(err => reject(err));
                });
            }
        });
    });
}

function verificarCiudad(id_pais, id_estado, nombreCiudad) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id_ciudad FROM ciudades WHERE nombre = ?`;
        db.get(sql, [nombreCiudad], (err, row) => {
            if (err) return reject(err);
            if (row) {
                resolve({ id_pais, id_estado, id_ciudad: row.id_ciudad });
            } else {
                const insertSql = `INSERT INTO ciudades (nombre) VALUES (?)`;
                db.run(insertSql, [nombreCiudad], function(err) {
                    if (err) return reject(err);
                    resolve({ id_pais, id_estado, id_ciudad: this.lastID });
                });
            }
        });
    });
}

function crearDireccion(id_pais, id_estado, id_ciudad) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO direcciones (pais, estado, ciudad) VALUES (?, ?, ?)`;
        db.run(sql, [id_pais, id_estado, id_ciudad], function(err) {
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
    },

    getParentescos: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT descripcion, es_directo FROM parentescos`
            db.all(sql, [], (err, rows) => {
                if(err) return reject(err);
                resolve(rows);
            });
        });
    },

    getOcupaciones: () => {
        return new Promise((resolve, reject) => {
            const sql= `SELECT descripcion FROM ocupaciones`;
            db.all(sql, [], (err,rows) => {
                if(err) return reject(err);
                resolve(rows)
            })
        })


    },

    countFamilyMembers:(id_usuario) => {
        const result = db.all(`SELECT parentesco FROM familiares WHERE id_usuario = ?`, [id_usuario]);

        let total = result.length;
        let noDirectos = 0;

        for (let row of result) {
            const p = db.get(`SELECT es_directo FROM parentescos WHERE descripcion = ?`, [row.parentesco]);
            if (p && p.es_directo === 0) {
                noDirectos++;
            }
        }

        return new Promise((resolve, reject) => {
            resolve({ total, noDirectos });
        });
    },

    // Aquí empiezan las funciones de menú
    getUserInfo: (id_usuario) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    u.id_usuario, u.nombre1, u.nombre2, u.apellido1, u.apellido2, u.correo, u.telefono, u.fecha_nacimiento,
                    paises.nombre AS pais, estados.nombre AS estado, ciudades.nombre AS ciudad,
                    o.descripcion AS ocupacion, p.capacidad_total, p.max_no_directos, p.precio_mensual
                FROM usuarios u
                JOIN usuarios_direccion ud ON u.id_usuario = ud.id_usuario
                JOIN direcciones d ON ud.id_direccion = d.id_direccion
                JOIN paises ON d.pais = paises.id_pais
                JOIN estados ON d.estado = estados.id_estado
                JOIN ciudades ON d.ciudad = ciudades.id_ciudad
                JOIN usuarios_ocupacion uo ON u.id_usuario = uo.id_usuario
                JOIN ocupaciones o ON uo.id_ocupacion = o.id_ocupacion
                JOIN planes p ON u.plan_id = p.id
                WHERE u.id_usuario = ?
            `;
            db.get(sql, [id_usuario], (err, row) => {
                if (err) return reject(err);
                if (row) {
                    resolve(row);
                } else {
                    reject(new Error('Usuario no encontrado'));
                }
            });
        });
    },
    
    getFamilyMembers: (id_usuario) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    f.id_familiar, f.nombre1, f.nombre2, f.apellido1, f.apellido2, f.correo, f.telefono, 
                    p.descripcion AS parentesco, o.descripcion AS ocupacion,
                    paises.nombre AS pais, estados.nombre AS estado, ciudades.nombre AS ciudad
                FROM familiares f
                JOIN familiares_parentesco fp ON f.id_familiar = fp.id_familiar
                JOIN parentescos p ON fp.id_parentesco = p.id_parentesco
                JOIN familiares_ocupacion fo ON f.id_familiar = fo.id_familiar
                JOIN ocupaciones o ON fo.id_ocupacion = o.id_ocupacion
                JOIN familiares_direccion fd ON f.id_familiar = fd.id_familiar
                JOIN direcciones d ON fd.id_direccion = d.id_direccion
                JOIN paises ON d.pais = paises.id_pais
                JOIN estados ON d.estado = estados.id_estado
                JOIN ciudades ON d.ciudad = ciudades.id_ciudad
                WHERE f.id_usuario = ?
            `;
            db.all(sql, [id_usuario], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    updateUserInfo: (id_usuario, campo, valor) => {
        return new Promise((resolve, reject) => {
            if(campo === 'direccion'){
                const { pais, estado, ciudad } = valor;
                verificarDireccion(pais, estado, ciudad)
                    .then(id_direccion => {
                        const sql = `UPDATE usuarios_direccion SET id_direccion = ? WHERE id_usuario = ?`;
                        db.run(sql, [id_direccion, id_usuario], function(err) {
                            if (err) return reject(err);
                            if (this.changes > 0) {
                                resolve({ message: 'Dirección actualizada exitosamente' });
                            } else {
                                reject(new Error('No se encontró el usuario o no se realizaron cambios'));
                            }
                        });
                    })
                    .catch(err => reject(err));
                return;
            }
            const sql = `UPDATE usuarios SET ${campo} = ? WHERE id_usuario = ?`;
            db.run(sql, [valor, id_usuario], function(err) {
                if (err) return reject(err);
                if (this.changes > 0) {
                    resolve({ message: 'Información actualizada exitosamente' });
                } else {
                    reject(new Error('No se encontró el usuario o no se realizaron cambios'));
                }
            });
        });
    },
    updateFamilyMember: (id_familiar, campo, valor) => {
        return new Promise((resolve, reject) => {
            if(campo === 'direccion'){
            const { pais, estado, ciudad } = valor;
            verificarDireccion(pais, estado, ciudad)
                    .then(id_direccion => {
                        const sql = `UPDATE usuarios_direccion SET id_direccion = ? WHERE id_usuario = ?`;
                        db.run(sql, [id_direccion, id_usuario], function(err) {
                            if (err) return reject(err);
                            if (this.changes > 0) {
                                resolve({ message: 'Dirección actualizada exitosamente' });
                            } else {
                                reject(new Error('No se encontró el usuario o no se realizaron cambios'));
                            }
                        });
                    })
                    .catch(err => reject(err));
                return;    
            }
            const sql = `UPDATE familiares SET ${campo} = ? WHERE id_familiar = ?`;
            db.run(sql, [valor, id_familiar], function(err) {
                if (err) return reject(err);
                if (this.changes > 0) {
                    resolve({ message: 'Información del familiar actualizada exitosamente' });
                } else {
                    reject(new Error('No se encontró el familiar o no se realizaron cambios'));
                }
            });
        });
    },
    deleteFamilyMember: (id_familiar) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM familiares WHERE id_familiar = ?`;
            db.run(sql, [id_familiar], function(err) {
                if (err) return reject(err);
                if (this.changes > 0) {
                    resolve({ message: 'Familiar eliminado exitosamente' });
                } else {
                    reject(new Error('No se encontró el familiar o no se realizaron cambios'));
                }
            });
        });
    },
    makePaymentPendiente(id_usuario) {
        return new Promise((resolve, reject) => {
            userModel.getUserPlan(id_usuario)
                .then(plan => {
                    const sql = `INSERT INTO pagos (id_usuario, monto, fecha, estado) VALUES (?, ?, datetime('now'), ?)`;
                    db.run(sql, [id_usuario, plan.precio_mensual, "pendiente"], function(err) {
                        if (err) return reject(err);
                        resolve({message: 'Pago pendiente registrado exitosamente', paymentId: this.lastID});
                    });
                })
                .catch(err => reject(err));
        });
    },

    PayPendiente: (id_pago) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE pagos SET estado = ? WHERE id_pago = ?`;
            db.run(sql, ["pagado", id_pago], function(err) {
                if (err) return reject(err);
                if (this.changes > 0) {
                    resolve({ message: 'Pago marcado como pagado exitosamente' });
                } else {
                    reject(new Error('No se encontró el pago o no se realizaron cambios'));
                }
            });
        });
    },
    getPaymentHistory: (id_usuario) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM pagos WHERE id_usuario = ? ORDER BY fecha DESC`;
            db.all(sql, [id_usuario], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }



    
}

module.exports = userModel;

