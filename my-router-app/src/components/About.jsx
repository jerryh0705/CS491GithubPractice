import { useParams } from 'react-router-dom';

const About = () => {
  const { name } = useParams();
  return (
    <div>
      <h3>About is here</h3>
      <p>Name: {name}</p>
    </div>
  );
};

export default About;