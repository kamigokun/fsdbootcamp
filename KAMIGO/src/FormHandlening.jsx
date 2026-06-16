import React from 'react'

const FormHandlening = () => {
   const [name, setName] = useState("");

  return (
    <div>
      <input
        type="text"
        placeholder="Enter name"
        onChange={(e) => setName(e.target.value)}
      />
      <h2>Hello, {name}</h2>
    </div>
  );
} 

export default FormHandlening