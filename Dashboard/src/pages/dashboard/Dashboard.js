import React, { Component } from 'react';
import '../../components/common/Common.css';
import { Grid, withStyles, useMediaQuery, CardContent, Card, Avatar }
    from '@material-ui/core';
import '../../components/common/CommonModal.css';
import { withRouter } from 'react-router-dom';
import Loader from '../../components/loader/Loader';
import api from '../../components/common/APIValues';
import { useStyles } from '../../components/common/useStyles';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import {
    PieChart, Pie, Cell, ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, AreaChart, LineChart
} from 'recharts';

const withMediaQuery = (...args) => Component => props => {
    const mediaQuery = useMediaQuery(...args);
    return <Component mediaQuery={mediaQuery} {...props} />;
};

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalOrders: null, customers: [], vegetables: [], salesOfficers: [], activeCustomers: null, inActiveCustomers: null,
            dailyOrders: [], loading: false,
        };
    }

    loadDashboardData(){
        let partialUrl = api.URL;
        fetch(partialUrl + 'Report/GetDashboardData')
            .then(res => res.json())
            .then(result => { this.setState({
                totalOrders: result.TotalOrders,
                customers: result.Customers,
                vegetables: result.Vegetables,
                salesOfficers: result.SalesOfficers,
                activeCustomers: result.ActiveCustomers,
                inActiveCustomers: result.InActiveCustomers,
                dailyOrders: result.DailyOrders,
                loading: false
            }); console.log(result.Customers) } )
            .catch(err => console.log(err));
    }

    componentDidMount() {
        let loggedInUser = sessionStorage.getItem('loggedInUser');

        if(loggedInUser) {
            this.setState({ userId: loggedInUser, loading: true });
            this.loadDashboardData();
        } else {
            const { history } = this.props;
            if (history) history.push('/Home');
        }
    }

    redirectToManageOrders = (event) => {
        const { history } = this.props;
        if (history) history.push('/ManageOrders');
    }

    redirectToDailyOrders = (event) => {
        const { history } = this.props;
        if (history) history.push('/Orders');
    }

    redirectToSalesOfficerBoard = (event) => {
        const { history } = this.props;
        if (history) history.push('/SalesOfficerBoard');
    }

    redirectToManageCustomers = (event) => {
        const { history } = this.props;
        if (history) history.push('/ManageCustomers');
    }

    render() {
        const { classes, mediaQuery } = this.props;
        const data = [
            { name: 'Active Customers', value: this.state.activeCustomers }, 
            { name: 'InActive Customers', value: this.state.inActiveCustomers }
        ];
        const COLORS = ['#347f58', '#e8e8e8'];
        const col4 = mediaQuery ? 4 : 12;
        const col8 = mediaQuery ? 8 : 12;

        return (
            <div>
                {this.state.loading ? (
                    <Loader />
                ) : (
                    <div>
                        <Grid container spacing={ mediaQuery ? 2 : 0 }>
                            <Grid item xs={col4}>
                                <Card className={classes.rootCard}>
                                    <CardContent className={classes.posGraph}>
                                        <Grid container spacing={0}>
                                            <Grid item xs={11}>
                                                <span className="dashboard-text-color">TODAY ORDERS</span>
                                                <br/>
                                                <span className="dashboard-sub-text">Last 30 Days</span>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <NavigateNextIcon onClick={() => this.redirectToManageOrders()} style={{ color: '#347f58'}}/>
                                            </Grid>
                                        </Grid>                                    
                                        <div style={{ textAlign: 'center', marginBottom: 7 }} className="dashboard-text">{ this.state.totalOrders }</div>
                                    </CardContent>
                                </Card>
                            </Grid>                    
                            <Grid item xs={col4}>
                                <Card className={classes.rootCard}>
                                    <CardContent className={classes.posGraph}>
                                        <Grid container spacing={0} style={{ marginBottom: 15 }}>
                                            <Grid item xs={11}>
                                                <span className="dashboard-text-color">TOP CUSTOMERS</span>
                                                <br/>
                                                <span className="dashboard-sub-text">Last 30 Days</span>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <NavigateNextIcon onClick={() => this.redirectToManageOrders()} style={{ color: '#347f58' }}/>
                                            </Grid>                                                                     
                                        </Grid>
                                        {this.state.customers.map((data, index) => (                                   
                                            <div className="dashboard-text-md">{data}</div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </Grid>                    
                            <Grid item xs={col4}>
                                <Card className={classes.rootCard}>
                                    <CardContent className={classes.posGraph}>
                                        <Grid container spacing={0} style={{ marginBottom: 15 }}>
                                            <Grid item xs={11}>
                                                <span className="dashboard-text-color">TOP VEGETABLES</span>
                                                <br/>
                                                <span className="dashboard-sub-text">Last 30 Days</span>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <NavigateNextIcon onClick={() => this.redirectToManageOrders()} style={{ color: '#347f58' }}/>
                                            </Grid>                                                                     
                                        </Grid>                                    
                                        {this.state.vegetables.map((data, index) => (                                   
                                            <div className="dashboard-text-md">{data.ProductName}: {data.TotalWeight} KG</div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Grid container spacing={ mediaQuery ? 2 : 0 }>
                            <Grid item xs={col8}>
                                <Card className={classes.rootCard}>
                                    <CardContent className={classes.posGraph}>
                                        <Grid container spacing={0}>
                                            <Grid item xs={11}>
                                                <span className="dashboard-text-color">DAILY ORDERS</span>
                                                <br/>
                                                <span className="dashboard-sub-text">Last 30 Days</span>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <NavigateNextIcon onClick={() => this.redirectToDailyOrders()} style={{ color: '#347f58'}}/>
                                            </Grid>
                                        </Grid>                                    
                                        <Grid item xs={12}>
                                            <ResponsiveContainer className={classes.chart} height={412} width='100%'>                            
                                                <ComposedChart data={this.state.dailyOrders}
                                                    margin={{ top: 50, bottom: 10 }}>
                                                    <YAxis type="number" />
                                                    <XAxis dataKey="OrderedDate" type="category" />
                                                    <Tooltip/>
                                                    <Bar dataKey='TotalOrders' barSize={15} fill='#347f58'/>
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={col4}>
                                <Grid container spacing={0}>
                                    <Grid item xs={12}>
                                        <Card className={classes.rootCard}>
                                            <CardContent className={classes.posGraph}>
                                                <Grid container spacing={0} style={{ marginBottom: 15 }}>
                                                    <Grid item xs={11}>
                                                        <span className="dashboard-text-color">TOP SALES</span>
                                                        <br/>
                                                        <span className="dashboard-sub-text">Last 30 Days</span>
                                                    </Grid>
                                                    <Grid item xs={1}>
                                                        <NavigateNextIcon onClick={() => this.redirectToSalesOfficerBoard()} style={{ color: '#347f58'}}/>
                                                    </Grid>
                                                </Grid>                                    
                                                {this.state.salesOfficers.map((data, index) => (                                                                                     
                                                    <div className="dashboard-text-md">
                                                        <Grid container spacing={0}>
                                                        <Grid item xs={2} style={{ marginBottom: 5 }}>
                                                            <Avatar style={{ backgroundColor: '#347f58' }} alt={ data } 
                                                            src="/static/images/avatar/1.jpg" />
                                                        </Grid>
                                                        <Grid item xs={10} style={{ marginTop: 10 }}>
                                                            { data }
                                                        </Grid>
                                                        </Grid>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={0}>
                                    <Grid item xs={12}>
                                        <Card className={classes.rootCard}>
                                            <CardContent className={classes.posGraph}>
                                                <Grid container spacing={0}>
                                                    <Grid item xs={11}>
                                                        <span className="dashboard-text-color">ACTIVE CUSTOMERS</span>
                                                        <br/>
                                                        <span className="dashboard-sub-text">Last 30 Days</span>
                                                    </Grid>
                                                    <Grid item xs={1}>
                                                        <NavigateNextIcon onClick={() => this.redirectToManageCustomers()} style={{ color: '#347f58'}}/>
                                                    </Grid>
                                                </Grid>                                    
                                                <Grid item xs={12}>
                                                    <ResponsiveContainer className={classes.chart} height={160} width='100%'>                            
                                                        <PieChart onMouseEnter={this.onPieEnter}>
                                                        <text style={{ fontSize: 24, fontWeight: 'bold' }} x='50%' y={65} dy={8} textAnchor="middle">
                                                            { this.state.activeCustomers }</text>
                                                        <text style={{ fontSize: 10 }} x='50%' y={85} dy={8} textAnchor="middle">ACTIVE CUSTOMERS</text>
                                                            <Pie data={data} innerRadius={60} outerRadius={80} 
                                                                fill="#8884d8">
                                                                {
                                                                    data.map((entry, index) => <Cell fill={COLORS[index % COLORS.length]}/>)
                                                                }
                                                            </Pie>
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </div>
                    )}
            </div>
        );
    }
}

export default withRouter(withStyles(useStyles)(withMediaQuery('(min-width:600px)')(Dashboard)))