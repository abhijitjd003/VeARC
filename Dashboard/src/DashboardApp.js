import React, { Component } from 'react';
import { Route } from 'react-router';
import Layout from './components/navigation/Layout';
import Categories from './pages/category/Categories';
import UserManagement from './pages/user/UserManagement';
import Dashboard from './pages/dashboard/Dashboard';

export default class DashboardApp extends Component {
    static displayName = DashboardApp.name;

    render() {
        return (
            <Layout>
                <Route path='/home/categories' component={Categories} />
                <Route path='/home/usermanagement' component={UserManagement} />
                <Route path='/home/dashboard' component={Dashboard} />
            </Layout>
        );
    }
}
