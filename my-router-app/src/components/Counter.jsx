import { useState } from 'react';
import { Button } from 'react-bootstrap';

const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h3>Counter</h3>
      <Button onClick={() => setCount(count - 1)}>-</Button>
      <span style={{ margin: '0 10px' }}>{count}</span>
      <Button onClick={() => setCount(count + 1)}>+</Button>
    </div>
  );
};

export default Counter;