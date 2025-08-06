import express from 'express';
import sql from 'mssql';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config({ debug: process.env.NODE_ENV !== 'production' });

// Verificación de variables de entorno
if (!process.env.DB_SERVER || !process.env.DB_DATABASE || !process.env.DB_USER || !process.env.DB_PASSWORD) {
  console.error("ERROR FATAL: Las variables de entorno de la base de datos no están configuradas. Por favor, revisa tu archivo .env.");
  process.exit(1);
}

const app = express();

const config = {
    user: process.env.DB_USER, // Usuario de la base de datos desde .env
    password: process.env.DB_PASSWORD, // Contraseña desde .env
    server: process.env.DB_SERVER, // Servidor desde .env
    port: parseInt(process.env.DB_PORT, 10), // Puerto desde .env
    database: process.env.DB_DATABASE, // Base de datos desde .env
    options: {
        // Para desarrollo local, puedes seguir usando la autenticación de Windows si lo prefieres,
        // pero la autenticación con usuario/contraseña es el estándar para producción.
        // trustedConnection: true,
        encrypt: process.env.NODE_ENV === 'production', // Usar 'true' para Azure o producción
        trustServerCertificate: true // Necesario para desarrollo local con certificados autofirmados
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

app.use(cors()); 
app.use(express.json());


app.post('/agregar-empleado', async (req, res) => {
    const { nombre, edad, pais, cargo, años } = req.body;
    
    if (!nombre || !edad || !pais || !cargo || !años) {
        return res.status(400).json({ mensaje: 'Faltan datos: nombre, edad, pais, cargo, años son requeridos.' });
    }

    try {
        const request = pool.request();
        
        request.input('nombre', sql.VarChar(50), nombre);
        request.input('edad', sql.Int, parseInt(edad)); // Se convierte a entero
        request.input('pais', sql.VarChar(50), pais);
        request.input('cargo', sql.VarChar(50), cargo);
        request.input('años', sql.Int, parseInt(años)); // Se convierte a entero
        
        await request.query(`
            -- Corregido: Asegúrate de que los nombres de columna aquí coincidan con tu tabla.
            INSERT INTO dbo.Empleados (nombreEmpleado, edadEmpleado, paisEmpleado, cargoEmpleado, TiempoLaborando)
            VALUES (@nombre, @edad, @pais, @cargo, @años)
        `);
        
        res.json({ mensaje: 'Usuario agregado correctamente' });
    } catch (err) {
        console.error('Error al agregar usuario:', err);
        res.status(500).json({ mensaje: `Error al agregar el empleado: ${err.message}` });
    }
});

app.get('/test-db', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).send('Servicio de base de datos no disponible.');
        }
        const request = pool.request();
        const result = await request.query('SELECT 1 AS test');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error en el test de la base de datos:', err);
        res.status(500).send(err.message);
    }
});


app.get('/consultar-empleado', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ mensaje: 'El pool de conexiones no está disponible.' });
        }
        const request = pool.request();
        
        const result = await request.query(`
            -- Corregido: Se usan alias para que el frontend reciba los nombres que espera (ej. 'edadEmpleado')
            SELECT idEmpleado,
                   nombreEmpleado,
                   edadEmpleado,
                   paisEmpleado,
                   cargoEmpleado,
                   TiempoLaborando
            FROM dbo.Empleados
        `);
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar usuarios:', err);
        res.status(500).json({ mensaje: `Error al consultar los empleados: ${err.message}` });
    }
});

app.put('/actualizar-empleado/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, edad, pais, cargo, años } = req.body;

    if (!nombre || !edad || !pais || !cargo || !años) {
        return res.status(400).json({ mensaje: 'Faltan datos para actualizar.' });
    }

    try {
        const request = pool.request();
        request.input('id', sql.Int, id);
        request.input('nombre', sql.VarChar(50), nombre);
        request.input('edad', sql.Int, parseInt(edad));
        request.input('pais', sql.VarChar(50), pais);
        request.input('cargo', sql.VarChar(50), cargo);
        request.input('años', sql.Int, parseInt(años));

        await request.query(`
            UPDATE dbo.Empleados
            SET nombreEmpleado = @nombre,
                edadEmpleado = @edad,
                paisEmpleado = @pais,
                cargoEmpleado = @cargo,
                TiempoLaborando = @años
            WHERE idEmpleado = @id
        `);

        res.json({ mensaje: 'Empleado actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar empleado:', err);
        res.status(500).json({ mensaje: `Error al actualizar empleado: ${err.message}` });
    }
});

app.delete('/eliminar-empleado/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const request = pool.request();
        request.input('id', sql.Int, id);
        
        const result = await request.query('DELETE FROM dbo.Empleados WHERE idEmpleado = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ mensaje: 'Empleado no encontrado.' });
        }

        res.json({ mensaje: 'Empleado eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar empleado:', err);
        res.status(500).json({ mensaje: `Error al eliminar empleado: ${err.message}` });
    }
});

let pool;
async function startServer() {
    try {
        pool = await sql.connect(config);
        console.log('Pool de conexión a SQL Server establecido.');

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
        });
    } catch (err) {
        console.error('Error al conectar a la base de datos. El servidor no se iniciará.', err);
        process.exit(1); // Detiene la aplicación si no se puede conectar a la BD
    }
}

startServer();

process.on('SIGINT', async () => {
    if (pool) {
        await pool.close();
        console.log('Pool de conexión a SQL Server cerrado.');
    }
    process.exit();
});