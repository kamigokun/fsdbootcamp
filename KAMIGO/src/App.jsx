import React, { useState } from 'react'

const App = () => {
  const [count, setCount] = useState(10)

  const handleIncrement = () => {
    setCount(count + 1)
  }

  const handleDecrement = () => {
    setCount(count - 1)
  }

  const handleReset = () => {
    setCount(10)
  }

  return (
    <>
      <h1>{count}</h1>

      <button onClick={handleIncrement}>+</button>
      <button onClick={handleDecrement}>-</button>
      <button onClick={handleReset}>Reset</button>
      
    </>
  )
}

export default App