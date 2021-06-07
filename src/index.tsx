import React from 'react';
import ReactDOM from 'react-dom';
import { ChakraProvider } from '@chakra-ui/react';

import App from '@/App';

const Root: React.FC = () => {
  return (
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

ReactDOM.render(
  <Root />,
  document.getElementById('app'),
);
