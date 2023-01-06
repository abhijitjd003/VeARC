import React, { Component } from 'react';
import { Route } from 'react-router';
import Home from './pages/home/Home';
import { Redirect } from 'react-router-dom';

export default class HomeApp extends Component {
    static displayName = HomeApp.name;

    render() {
        return (
            <div>
                <div>
                    <Route exact path="/" render={() => <Redirect to="/Home" />} />                    
                    <Route path="/" component={Home} />
                </div>
            </div>
        );
    }
}