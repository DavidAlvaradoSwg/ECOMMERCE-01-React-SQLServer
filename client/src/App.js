import './App.css';
import{ useState } from "react"

function App() {
//variables de entorno
  const[nombre, setNombre] = useState("");
  const[edad, setEdad] = useState(0);
  const[pais, setPais] = useState("");
  const[cargo, setCargo] = useState("");
  const[años, setAños] = useState(0);

  return (
    <div className="App">
     <div className="datos"> 

      <label>Nombre:<input
      onChange={(event)=>{
        setNombre(event.target.value);
      }}
      type="text"/></label><br/>


      <label>Edad:<input
       onChange={(event)=>{
        setEdad(event.target.value);
      }}
      
      type="text"/></label><br/> 
      
      <label>Pais:<input
       onChange={(event)=>{
        setPais(event.target.value);
       }}
       type="text"/></label><br/>
    

      <label>Cargo:<input
       onChange={(event)=>{
        setNombre(event.target.value);
      }}
       type="text"/></label><br/>
      <label>Años<input 
       onChange={(event)=>{
        setAños(event.target.value);
      }}
      type="number"/></label><br/> {/* alt+0241 */}
      <button>Registrar</button>
      </div>
    </div>
  );
}

export default App;