import React from 'react';
import { Switch, Route } from 'react-router-dom';
import {
  Container,
} from '@chakra-ui/react';

import IndexPage from '@/pages';

import { RoutePath } from './routes';

const Main: React.FC = () => {
  return (
    <Switch>
      <Route exact path={RoutePath.home} component={IndexPage} />
    </Switch>
  );
};

const App: React.FC = () => {
  return (
    <Container centerContent maxW="lg" mt={2}>
      <Main />
    </Container>
  );
};

export default App;
