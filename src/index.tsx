import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

import App from '@/App';

const Root: React.FC = () => {
  return (
    <Router>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </Router>
  );
};

ReactDOM.render(
  <Root />,
  document.getElementById('app'),
);
