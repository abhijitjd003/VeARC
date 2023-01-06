import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, HashRouter } from 'react-router-dom';
import DashboardApp from './DashboardApp';
import HomeApp from './HomeApp';
import { Route } from 'react-router';
import * as serviceWorker from './serviceWorker';
import "core-js/stable";
import "regenerator-runtime/runtime";
import "isomorphic-fetch";
import { createBrowserHistory } from 'history';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');

export const history = createBrowserHistory();

ReactDOM.render(
    <HashRouter>
        <Switch>
            <Route exact path="/(Home)" component={HomeApp} />
            <Route exact path="/" component={HomeApp} />
            <Route component={DashboardApp} />
        </Switch>
    </HashRouter>,
rootElement);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
