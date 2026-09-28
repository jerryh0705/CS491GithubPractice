import { useParams } from 'react-router-dom';

const Contact = () => {
  const { name, city } = useParams();
  return (
    <div>
      <h3>Contact is here</h3>
      <p>Name: {name}, City: {city}</p>
    </div>
  );
};

export default Contact;