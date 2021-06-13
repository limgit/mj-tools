import React from 'react';
import { Switch, Route } from 'react-router-dom';
import {
  Container,
} from '@chakra-ui/react';

import IndexPage from '@/pages';
import LogPage from '@/pages/log';
import CalcPage from '@/pages/calc';

import { RoutePath } from './routes';

const Main: React.FC = () => {
  return (
    <Switch>
      <Route exact path={RoutePath.home} component={IndexPage} />
      <Route path={RoutePath.log} component={LogPage} />
      <Route path={RoutePath.calc} component={CalcPage} />
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
