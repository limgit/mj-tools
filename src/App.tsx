import React from 'react';
import { Switch, Route } from 'react-router-dom';

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
    <Main />
  );
};

export default App;
