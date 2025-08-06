import './App.css';
import { useState, useEffect } from "react";

function App() {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState(""); // Cambiado a string para el input
  const [pais, setPais] = useState("");
  const [cargo, setCargo] = useState("");
  const [años, setAños] = useState(""); // Cambiado a string para el input
  const [empleados, setEmpleados] = useState([]);

  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  // Función para obtener los empleados del servidor
  const getEmpleados = async () => {
    try {
      const response = await fetch('http://localhost:3001/consultar-empleado', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudieron obtener los empleados');
      }
      setEmpleados(data);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      alert('Hubo un error al obtener la lista de empleados: ' + error.message);
    }
  };

  useEffect(() => { getEmpleados() }, []);
  // Función para enviar los datos al servidor
  const agregarEmpleado = async () => {
    try {
      const response = await fetch('http://localhost:3001/agregar-empleado', {
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
      limpiarCampos();
      getEmpleados(); // Actualiza la lista después de agregar
      
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al agregar el usuario: ' + error.message);
    }
  };

  const actualizarEmpleado = async () => {
    try {
      const response = await fetch(`http://localhost:3001/actualizar-empleado/${idEditando}`, {
        method: 'PUT',
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
        throw new Error(data.mensaje || 'Error al actualizar el empleado');
      }

      alert(data.mensaje);
      cancelarEdicion();
      getEmpleados();
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      alert('Hubo un error al actualizar el empleado: ' + error.message);
    }
  };

  const eliminarEmpleado = async (id) => {
    const confirmacion = window.confirm(`¿Estás seguro de que deseas eliminar al empleado con ID ${id}?`);
    if (!confirmacion) return;

    try {
      const response = await fetch(`http://localhost:3001/eliminar-empleado/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al eliminar');
      alert(data.mensaje);
      getEmpleados();
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      alert(`Error al eliminar empleado: ${error.message}`);
    }
  };

  const limpiarCampos = () => {
    setNombre("");
    setEdad("");
    setPais("");
    setCargo("");
    setAños("");
  };

  const cancelarEdicion = () => {
    limpiarCampos();
    setEditando(false);
    setIdEditando(null);
  };

  const editarEmpleado = (empleado) => {
    setEditando(true);
    setIdEditando(empleado.idEmpleado);
    
    // Llenar el formulario con los datos del empleado a editar
    setNombre(empleado.nombreEmpleado);
    setEdad(empleado.edadEmpleado.toString());
    setPais(empleado.paisEmpleado);
    setCargo(empleado.cargoEmpleado);
    setAños(empleado.TiempoLaborando.toString());
  };

  return (
    <div className="App">
      <div className="datos"> <h1>Gestión de Empleados</h1> 
<div class = "form"> <div class = "titulo">   </div>

 <h1>Ingresar Empleados</h1>  
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
        
        {
          editando ?
          <div className='btn-group'>
            <button className='btn-actualizar' onClick={actualizarEmpleado}>Actualizar</button>
            <button className='btn-cancelar' onClick={cancelarEdicion}>Cancelar</button>
          </div> :
          <button onClick={agregarEmpleado}>Registrar</button>
        }
              
      </div>


      <div className="lista-empleados">
</div>
      

{/* 
        <button onClick={getEmpleados}>Mostrar/Actualizar Lista</button> */}

      

                  <div class = "titulo">     <h2>Lista de Empleados</h2>  </div>

        <table class = "tabla">
          
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Edad</th>
              <th>País</th>
              <th>Cargo</th>
              <th>Años Laborando</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((val) => {
              return (
                <tr key={val.idEmpleado}>
                  <td>{val.idEmpleado}</td>
                  <td>{val.nombreEmpleado}</td>
                  <td>{val.edadEmpleado}</td>
                  <td>{val.paisEmpleado}</td>
                  <td>{val.cargoEmpleado}</td>
                  <td>{val.TiempoLaborando}</td>
                  <td>
                    <button className="btn-editar" onClick={() => editarEmpleado(val)}>Editar</button>
                    <button className="btn-eliminar" onClick={() => eliminarEmpleado(val.idEmpleado)}>Eliminar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}



export default App;
