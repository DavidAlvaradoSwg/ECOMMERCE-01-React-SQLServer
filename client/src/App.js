import './App.css';
import { useState } from "react";

function App() {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState(""); // Cambiado a string para el input
  const [pais, setPais] = useState("");
  const [cargo, setCargo] = useState("");
  const [años, setAños] = useState(""); // Cambiado a string para el input

  // Función para enviar los datos al servidor
  const agregarEmpleado = async () => {
    try {
      const response = await fetch('http://localhost:3001/agregar-usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre,
          edad: parseInt(edad),
          pais: pais,
          cargo: cargo,
          años: parseInt(años)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error en la respuesta del servidor');
      }

      alert(data.mensaje);
      // Limpiar los campos del formulario
      setNombre("");
      setEdad("");
      setPais("");
      setCargo("");
      setAños("");
      
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al agregar el usuario: ' + error.message);
    }
  };

  return (
    <div className="App">
      <div className="datos"> 
        <label>Nombre:
          <input
            onChange={(event) => setNombre(event.target.value)}
            type="text"
            value={nombre}
          />
        </label><br/>
        
        <label>Edad:
          <input
            onChange={(event) => setEdad(event.target.value)}
            type="number" // Tipo correcto para un valor numérico
            value={edad}
          />
        </label><br/>
        
        <label>Pais:
          <input
            onChange={(event) => setPais(event.target.value)}
            type="text"
            value={pais}
          />
        </label><br/>
        
        <label>Cargo:
          <input
            onChange={(event) => setCargo(event.target.value)} // CORREGIDO: ahora actualiza el estado de `cargo`
            type="text"
            value={cargo}
          />
        </label><br/>
        
        <label>Años:
          <input
            onChange={(event) => setAños(event.target.value)}
            type="number"
            value={años}
          />
        </label><br/>
        
        <button onClick={agregarEmpleado}>Registrar</button>
      </div>
    </div>
  );
}

export default App;