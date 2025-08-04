import express from 'express';
import sql from 'mssql';
import cors from 'cors';
const app = express();


const config = {
    // No se necesitan 'user' ni 'password' para la autenticación de Windows
    server: 'DAVIDPC\\SQLSERVER', // El nombre de tu servidor y la instancia
    database: 'ReactApp1.3', // El nombre de la base de datos a la que quieres conectarte
    user: "sa",
    password:"Manzana16.",
    options: {
        trustedConnection: true, // Esto indica que uses la autenticación de Windows
        encrypt: false, // O true si usas Azure
        trustServerCertificate: true // Necesario para entornos de desarrollo local
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};
app.use(cors()); 
app.use(express.json());

let pool;
async function startDbPool() {
    try {
        pool = await sql.connect(config);
        console.log('Pool de conexión a SQL Server establecido.');
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
    }
}
startDbPool();

app.post('/agregar-usuario', async (req, res) => {
    const { nombre, edad, pais, cargo, años } = req.body;
    
    if (!nombre || !edad || !pais || !cargo || !años) {
        return res.status(500).send('Faltan datos de usuario (nombre, edad, pais, cargo, años).');
    }

    try {
        const request = pool.request();
        
        request.input('nombre', sql.VarChar(50), nombre);
        request.input('edad', sql.Int, parseInt(edad)); // Se convierte a entero
        request.input('pais', sql.VarChar(50), pais);
        request.input('cargo', sql.VarChar(50), cargo);
        request.input('años', sql.Int, parseInt(años)); // Se convierte a entero
        
        await request.query(`
            INSERT INTO dbo.Table_2 (nombreEmpleado, edadEmpleado, paisEmpleado, cargoEmpleado, TiempoLaborando)
            VALUES (@nombre, @edad, @pais, @cargo, @años)
        `);
        
        res.json({ mensaje: 'Usuario agregado correctamente' });
    } catch (err) {
        console.error('Error al agregar usuario:', err);
        res.status(500).send(err.message);
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

process.on('SIGINT', async () => {
    if (pool) {
        await pool.close();
        console.log('Pool de conexión a SQL Server cerrado.');
    }
    process.exit();
});