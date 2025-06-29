const sqlite3= require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a la BD:', err.message);
  } else {
    console.log('Conectado con exito a la BD de CODE-SALUD');
    db.run('PRAGMA foreign_keys = ON;'); 
  }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ocupaciones (
        id_ocupacion INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion TEXT NOT NULL UNIQUE
    );`);
  
    db.run(`CREATE TABLE IF NOT EXISTS parentescos (
        id_parentesco INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion TEXT NOT NULL UNIQUE,
        es_directo BOOLEAN NOT NULL
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS paises (
        id_pais INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS estados (
        id_estado INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS ciudades (
        id_ciudad INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE
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
        id_usuario_ocupacion INTEGER PRIMARY KEY AUTOINCREMENT,
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
        nombre TEXT NOT NULL UNIQUE,
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

    db.run(`CREATE TABLE IF NOT EXISTS familiares_ocupacion (
        id_familiar_ocupacion INTEGER PRIMARY KEY AUTOINCREMENT,
        id_familiar INTEGER NOT NULL,
        id_ocupacion INTEGER NOT NULL,
        FOREIGN KEY (id_familiar) REFERENCES familiares(id_familiar) ON DELETE CASCADE,
        FOREIGN KEY (id_ocupacion) REFERENCES ocupaciones(id_ocupacion)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS familiares_direccion (
        id_familiar_direccion INTEGER PRIMARY KEY AUTOINCREMENT,
        id_familiar INTEGER NOT NULL,
        id_direccion INTEGER NOT NULL,
        FOREIGN KEY (id_familiar) REFERENCES familiares(id_familiar) ON DELETE CASCADE,
        FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS familiares_parentesco (
        id_familiar_parentesco INTEGER PRIMARY KEY AUTOINCREMENT,
        id_familiar INTEGER NOT NULL,
        id_parentesco INTEGER NOT NULL,
        FOREIGN KEY (id_familiar) REFERENCES familiares(id_familiar) ON DELETE CASCADE,
        FOREIGN KEY (id_parentesco) REFERENCES parentescos(id_parentesco)
    );`);

    db.run(`INSERT OR IGNORE INTO parentescos (descripcion, es_directo) VALUES
    ('Padre', 1),
    ('Madre', 1),
    ('Hijo', 1),
    ('Hija', 1),
    ('Hermano', 1),
    ('Hermana', 1),
    ('Abuelo', 1),
    ('Abuela', 1),
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
        descripcion TEXT,
        periodo TEXT,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    );`);
});

module.exports = db;

