import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import './css/general.css'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard'


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route path='/dashboard' exact component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </BrowserRouter>
  )
}

export default App;

