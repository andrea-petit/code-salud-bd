const sqlite3= require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a la BD:', err.message);
  } else {
    console.log('Conectado con exito a la BD de CODE-SALUD');
  }
});

/*

CREATE TABLE IF NOT EXISTS ocupaciones (
    id_ocupacion INTEGER PRIMARY KEY,
    descripcion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS parentescos (
    id_parentesco INTEGER PRIMARY KEY,
    descripcion TEXT NOT NULL,
    es_directo BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS paises (
    id_pais INTEGER PRIMARY KEY,
    descripcion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS estados (
    id_estado INTEGER PRIMARY KEY,
    descripcion TEXT NOT NULL,
    id_pais INTEGER NOT NULL,
    FOREIGN KEY (id_pais) REFERENCES paises(id_pais)
);

CREATE TABLE IF NOT EXISTS ciudades (
    id_ciudad INTEGER PRIMARY KEY,
    descripcion TEXT NOT NULL,
    id_estado INTEGER NOT NULL,
    FOREIGN KEY (id_estado) REFERENCES estados(id_estado)
);

CREATE TABLE IF NOT EXISTS direcciones (
    id_direccion INTEGER PRIMARY KEY,
    descripcion TEXT NOT NULL
);



CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY,
    nombres TEXT NOT NULL,
    cedula TEXT UNIQUE NOT NULL,
    clave TEXT NOT NULL,
    fecha_nacimiento TEXT NOT NULL,
    correo TEXT,
    telefono TEXT,
    plan_id INTEGER,
    FOREIGN KEY (plan_id) REFERENCES planes(id)
);

CREATE TABLE IF NOT EXISTS usuarios_ocupacion (
    id_usuario_ocupacion INTEGER PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_ocupacion INTEGER NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_ocupacion) REFERENCES ocupaciones(id_ocupacion)
);

CREATE TABLE IF NOT EXISTS usuarios_direccion (
    id_usuario_direccion INTEGER PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_direccion INTEGER NOT NULL,
    id_ciudad INTEGER NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion),
    FOREIGN KEY (id_ciudad) REFERENCES ciudades(id_ciudad)
);


CREATE TABLE planes IF NOT EXISTS (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    capacidad_total INTEGER NOT NULL,
    max_no_directos INTEGER NOT NULL,
    precio_mensual REAL NOT NULL
);


INSERT OR IGNORE INTO planes (id, nombre, capacidad_total, max_no_directos, precio_mensual) VALUES
(1, 'BASICO', 5, 1, 1500),
(2, 'PRO', 7, 3, 3000),
(3, 'PLUS', 9, 4, 4500),
(4, 'PREMIUM', 11, 5, 6000),
(5, 'GOLD', 17, 10, 7500);

CREATE TABLE IF NOT EXISTS servicios (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('incluido', 'adicional')) NOT NULL,
    precio_base REAL DEFAULT 0
);

INSERT OR IGNORE INTO servicios (id, nombre, tipo, precio_base) VALUES
(1, 'Consulta médica general', 'incluido', 0),
(2, 'Odontología básica', 'incluido', 0),
(3, 'Laboratorio clínico', 'adicional', 150.00),
(4, 'Psicología', 'adicional', 300.00),
(5, 'Oftalmología', 'adicional', 300.00);

CREATE TABLE IF NOT EXISTS planes_servicios (
    plan_id INTEGER NOT NULL,
    servicio_id INTEGER NOT NULL,
    PRIMARY KEY (plan_id, servicio_id),
    FOREIGN KEY (plan_id) REFERENCES planes(id),
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

INSERT OR IGNORE INTO planes_servicios (plan_id, servicio_id) VALUES
(1, 1), (1, 2), 
(2, 1), (2, 2),
(3, 1), (3, 2), (3, 3),
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 2), (5, 3);

CREATE TABLE IF NOT EXISTS familiares (
    id_familiar INTEGER PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    nombres TEXT NOT NULL,
    cedula TEXT NOT NULL,
    correo TEXT,
    telefono TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS familiares_ocupacion (
    id_familiar_ocupacion INTEGER PRIMARY KEY,
    id_familiar INTEGER NOT NULL,
    id_ocupacion INTEGER NOT NULL,
    FOREIGN KEY (id_familiar) REFERENCES familiares(id_familiar),
    FOREIGN KEY (id_ocupacion) REFERENCES ocupaciones(id_ocupacion)
);

CREATE TABLE IF NOT EXISTS familiares_direccion (
    id_familiar_direccion INTEGER PRIMARY KEY,
    id_familiar INTEGER NOT NULL,
    id_direccion INTEGER NOT NULL,
    id_ciudad INTEGER NOT NULL,
    FOREIGN KEY (id_familiar) REFERENCES familiares(id_familiar),
    FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion),
    FOREIGN KEY (id_ciudad) REFERENCES ciudades(id_ciudad)
);

CREATE TABLE IF NOT EXISTS familiares_parentesco (
    id_familiar_parentesco INTEGER PRIMARY KEY,
    id_familiar INTEGER NOT NULL,
    id_parentesco INTEGER NOT NULL,
    FOREIGN KEY (id_familiar) REFERENCES familiares(id_familiar),
    FOREIGN KEY (id_parentesco) REFERENCES parentescos(id_parentesco)
);

INSERT OR IGNORE INTO parentescos (id_parentesco, descripcion, es_directo) VALUES
(1, 'Padre', 1),
(2, 'Madre', 1),
(3, 'Hijo', 1),
(4, 'Hija', 1),
(5, 'Hermano', 1),
(6, 'Hermana', 1),
(7, 'Abuelo', 0),
(8, 'Abuela', 0),
(9, 'Tío', 0),
(10, 'Tía', 0),
(11, 'Primo', 0),
(12, 'Prima', 0);

INSERT OR IGNORE INTO ocupaciones (id_ocupacion, descripcion) VALUES
(1, 'Estudiante'),
(2, 'Empleado público'),
(3, 'Empleado privado'),
(4, 'Independiente'),
(5, 'Desempleado'),
(6, 'Jubilado');

CREATE TABLE pagos (
    id INTEGER PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    monto REAL NOT NULL,
    fecha TEXT NOT NULL,
    estado TEXT CHECK (estado IN ('pagado', 'pendiente')) DEFAULT 'pendiente' NOT NULL,
    servicio_id INTEGER,
    descripcion TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

*/

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ocupaciones (
        id_ocupacion INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion TEXT NOT NULL
    );`);
  
    db.run(`CREATE TABLE IF NOT EXISTS parentescos (
        id_parentesco INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion TEXT NOT NULL,
        es_directo BOOLEAN NOT NULL
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS paises (
        id_pais INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS estados (
        id_estado INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS ciudades (
        id_ciudad INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS direcciones (
        id_direccion INTEGER PRIMARY KEY,
        pais INTEGER NOT NULL,
        estado INTEGER NOT NULL,
        ciudad INTEGER NOT NULL,
        FOREIGN KEY (pais) REFERENCES paises(id_pais),
        FOREIGN KEY (estado) REFERENCES estados(id_estado),
        FOREIGN KEY (ciudad) REFERENCES ciudades(id_ciudad)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS familiares (
        id_familiar INTEGER PRIMARY KEY,
        id_usuario INTEGER NOT NULL,
        nombre1 TEXT NOT NULL,
        nombre2 TEXT,
        apellido1 TEXT NOT NULL,
        apellido2 TEXT NOT NULL,
        correo TEXT UNIQUE,
        telefono TEXT,
        id_direccion INTEGER,
        FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario INTEGER PRIMARY KEY,
        nombre1 TEXT NOT NULL,
        nombre2 TEXT,
        apellido1 TEXT NOT NULL,
        apellido2 TEXT NOT NULL,
        password TEXT NOT NULL,
        fecha_nacimiento TEXT NOT NULL,
        correo TEXT UNIQUE,
        telefono TEXT,
        plan_id INTEGER,
        FOREIGN KEY (plan_id) REFERENCES planes(id)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS usuarios_ocupacion (
        id_usuario_ocupacion INTEGER PRIMARY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        id_ocupacion INTEGER NOT NULL,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (id_ocupacion) REFERENCES ocupaciones(id_ocupacion)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS usuarios_direccion (
        id_usuario_direccion INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        id_direccion INTEGER NOT NULL,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS planes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        capacidad_total INTEGER NOT NULL,
        max_no_directos INTEGER NOT NULL,
        precio_mensual REAL NOT NULL
    );`);

    db.run(`INSERT OR IGNORE INTO planes (nombre, capacidad_total, max_no_directos, precio_mensual) VALUES
    ('BASICO', 5, 1, 1500),
    ('PRO', 7, 3, 3000),
    ('PLUS', 9, 4, 4500),
    ('PREMIUM', 11, 5, 6000),
    ('GOLD', 17, 10, 7500);`);

    db.run(`CREATE TABLE IF NOT EXISTS servicios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        tipo TEXT CHECK (tipo IN ('incluido', 'adicional')) NOT NULL,
        precio_base REAL DEFAULT 0
    );`);

    db.run(`INSERT OR IGNORE INTO servicios (nombre, tipo, precio_base) VALUES
    ('Consulta médica general', 'incluido', 0),
    ('Odontología básica', 'incluido', 0),
    ('Laboratorio clínico', 'adicional', 150.00),
    ('Psicología', 'adicional', 300.00),
    ('Oftalmología', 'adicional', 300.00);`);

    db.run(`CREATE TABLE IF NOT EXISTS planes_servicios (
        plan_id INTEGER NOT NULL,
        servicio_id INTEGER NOT NULL,
        PRIMARY KEY (plan_id, servicio_id),
        FOREIGN KEY (plan_id) REFERENCES planes(id),
        FOREIGN KEY (servicio_id) REFERENCES servicios(id)
    );`);

    db.run(`INSERT OR IGNORE INTO planes_servicios (plan_id, servicio_id) VALUES
    (1, 1), (1, 2), 
    (2, 1), (2, 2),
    (3, 1), (3, 2), (3, 3),
    (4, 1), (4, 2), (4, 3),
    (5, 1), (5, 2), (5, 3);`);

    db.run(`CREATE TABLE IF NOT EXISTS familiares_ocupacion (
        id_familiar_ocupacion INTEGER PRIMARY KEY AUTOINCREMENT,
        id_familiar INTEGER NOT NULL,
        id_ocupacion INTEGER NOT NULL,
        FOREIGN KEY (id_familiar) REFERENCES familiares(id_familiar),
        FOREIGN KEY (id_ocupacion) REFERENCES ocupaciones(id_ocupacion)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS familiares_direccion (
        id_familiar_direccion INTEGER PRIMARY KEY AUTOINCREMENT,
        id_familiar INTEGER NOT NULL,
        id_direccion INTEGER NOT NULL,
        id_ciudad INTEGER NOT NULL,
        FOREIGN KEY (id_familiar) REFERENCES familiares(id_familiar),
        FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS familiares_parentesco (
        id_familiar_parentesco INTEGER PRIMARY KEY AUTOINCREMENT,
        id_familiar INTEGER NOT NULL,
        id_parentesco INTEGER NOT NULL,
        FOREIGN KEY (id_familiar) REFERENCES familiares(id_familiar),
        FOREIGN KEY (id_parentesco) REFERENCES parentescos(id_parentesco)
    );`);

    db.run(`INSERT OR IGNORE INTO parentescos (descripcion, es_directo) VALUES
    ('Padre', 1),
    ('Madre', 1),
    ('Hijo', 1),
    ('Hija', 1),
    ('Hermano', 1),
    ('Hermana', 1),
    ('Abuelo', 0),
    ('Abuela', 0),
    ('Tío', 0),
    ('Tía', 0),
    ('Primo', 0),
    ('Prima', 0);`);

    db.run(`INSERT OR IGNORE INTO ocupaciones (descripcion) VALUES
    ('Estudiante'),
    ('Empleado público'),
    ('Empleado privado'),
    ('Independiente'),
    ('Desempleado'),
    ('Jubilado');`);

    db.run(`CREATE TABLE IF NOT EXISTS pagos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        monto REAL NOT NULL,
        fecha TEXT NOT NULL,
        estado TEXT CHECK (estado IN ('pagado', 'pendiente')) DEFAULT 'pendiente' NOT NULL,
        servicio_id INTEGER,
        descripcion TEXT,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (servicio_id) REFERENCES servicios(id)
    );`);


});

module.exports = db;

