import React, { Component } from 'react';
import clsx from 'clsx';
import {
    Button, AppBar, withStyles, Toolbar, List, CssBaseline, Typography, IconButton,
    ListItem, ListItemText, Drawer, Tooltip, useMediaQuery, Collapse, Divider
} from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircleOutlined';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import '../../components/common/Common.css'
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import IconExpandLess from '@material-ui/icons/ExpandLess'
import IconExpandMore from '@material-ui/icons/ExpandMore'
import SettingsIcon from '@material-ui/icons/Settings';
import PaymentIcon from '@material-ui/icons/Payment';
import BarChartIcon from '@material-ui/icons/BarChart';
import FarmarLogo from '../../components/common/farmar_horizontal.png';
import AppsIcon from '@material-ui/icons/Apps';

const drawerWidth = 240;

const useStyles = theme => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: 'white',
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        left: 0,
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        transition: theme.transitions.create('left', {
            easing: theme.transitions.easing.sharp,
            duration: 500,
        }),
    },
    drawerOpen: {
        transition: theme.transitions.create('left', {
            easing: theme.transitions.easing.sharp,
            duration: 500,
        }),
        width: drawerWidth,        
        backgroundColor: 'white',        
    },
    drawerShow: {
        transition: theme.transitions.create('left', {
            easing: theme.transitions.easing.sharp,
            duration: 500,
        }),
        width: drawerWidth,        
        backgroundColor: 'white',
        position: 'fixed',
        left: '0px',
        zIndex: 100,
    },
    drawerClose: {
        transition: theme.transitions.create('left', {
            easing: theme.transitions.easing.sharp,
            duration: 500,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(8) + 0,
        },
        backgroundColor: 'white',
    },
    drawerHide: {
        transition: theme.transitions.create('left', {
            easing: theme.transitions.easing.sharp,
            duration: 500,
        }),
        overflowX: 'hidden',
        //width: theme.spacing(),
        // [theme.breakpoints.up('sm')]: {
        //     width: theme.spacing(8) + 0,
        // },
        backgroundColor: 'white',
        position: 'fixed',
        left: '-240px',
        zIndex: 100,
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
        marginTop: 50,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    alignment: {
        flexGrow: 1,
    },
    leftIcon: {
        marginRight: theme.spacing.unit,
    },
    drawerMenu: {
        textAlign: 'center',
        width: 89,
    },
    iconColor: {
        color: 'white'
    },
    textColor: {
        color: 'white'
    },
    btnText: {
        fontSize: 12, color: 'white'
    }
});

const withMediaQuery = (...args) => Component => props => {
    const mediaQuery = useMediaQuery(...args);    
    return <Component mediaQuery={mediaQuery} {...props} />;
  };

class NavMenu extends Component {
    static displayName = NavMenu.name;
    constructor(props) {
        super(props);
        this.state = { 
            open: true, currentStatus: '', openProducts: false, openVendors: false, openStocks: false, openCustomers: false,
            openOrders: false, openPayments: false, openConfigurations: false, openReports: false,
        };
    }

    handleDrawerOpen = () => {        
        this.setState({ open: true })
    };
    handleDrawerClose = () => {
        this.setState({ open: false })
    };

    handleProducts = () => {
        this.setState({ 
            openProducts: !this.state.openProducts, openVendors: false, openStocks: false, openCustomers: false, openOrders: false,
            openPayments: false, openConfigurations: false, openReports: false
        })
    };
    handleVendors = () => {
        this.setState({ 
            openVendors: !this.state.openVendors, openProducts: false, openStocks: false, openCustomers: false, openOrders: false,
            openPayments: false, openConfigurations: false, openReports: false
        })
    };
    handleStocks = () => {
        this.setState({ 
            openStocks: !this.state.openStocks, openProducts: false, openVendors: false, openCustomers: false, openOrders: false,
            openPayments: false, openConfigurations: false, openReports: false
        })
    };
    handleCustomers = () => {
        this.setState({ 
            openCustomers: !this.state.openCustomers, openProducts: false, openVendors: false, openStocks: false, openOrders: false,
            openPayments: false, openConfigurations: false, openReports: false
        })
    };
    handleOrders = () => {
        this.setState({ 
            openOrders: !this.state.openOrders, openProducts: false, openVendors: false, openStocks: false, openCustomers: false,
            openPayments: false, openConfigurations: false, openReports: false
        })
    };
    handlePayments = () => {
        this.setState({ 
            openPayments: !this.state.openPayments, openProducts: false, openVendors: false, openStocks: false, openCustomers: false,
            openOrders: false, openConfigurations: false, openReports: false
        })
    };
    handleConfigurations= () => {
        this.setState({ 
            openConfigurations: !this.state.openConfigurations, openProducts: false, openVendors: false, openStocks: false, openCustomers: false,
            openOrders: false, openPayments: false, openReports: false
        })
    };
    handleReports= () => {
        this.setState({ 
            openReports: !this.state.openReports, openProducts: false, openVendors: false, openStocks: false, openCustomers: false,
            openOrders: false, openPayments: false, openConfigurations: false
        })
    };

    logOut = (event) => {
        event.preventDefault();        
        sessionStorage.setItem('loggedInUser', '');
        const { history } = this.props;
        if (history) history.push('/Home');
    }

    redirectToDashboard = (event) => {
        event.preventDefault();
        const { history } = this.props;
        if (history) history.push('/Dashboard');
    }

    hideNavBar(){
        console.log(this.state.open)
        if(window.innerWidth <= 600) {
            this.setState({ open: true });
        }
    }

    redirectToProductSales = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/ProductSales');
    }

    redirectToProducts = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/Products');
    }

    redirectToProductHistory = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/ProductPriceHistory');
    }

    redirectToCategories = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/home/categories');
    }

    redirectToAddCustomers = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/AddCustomers');
    }

    redirectToManageCustomers = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/ManageCustomers');
    }

    redirectToManageOrders = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/ManageOrders');
    }

    redirectToCreateOrders = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/CreateOrders');
    }

    redirectToUserManagement = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/UserManagement');
    }

    redirectToOrderSummary = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/OrderSummary');
    }

    redirectToVendorTypes = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/VendorTypes');
    }

    redirectToAddVendors = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/AddVendors');
    }

    redirectToAddStocks = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/AddStocks');
    }

    redirectToGradeAStocks = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/GradeAStock');
    }

    redirectToGradeBStocks = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/GradeBStock');
    }
    
    redirectToOrderPickupDetails = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/Settings');
    }

    redirectToStocksOutstanding = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/GradeBStockOutstanding');
    }

    redirectToAssignRoutes = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/AssignRoutes');
    }

    redirectToManagePayments = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/ManagePayments');
    }

    redirectToSalesOfficerBoard = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/SalesOfficerBoard');
    }

    redirectToNotifications = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/PushNotifications');
    }

    redirectToCustomersOTP = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/CustomersOTP');
    }

    redirectToCustomerOrders = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/CustomerOrders');
    }

    redirectToOrders = (event) => {
        event.preventDefault();
        this.hideNavBar();
        const { history } = this.props;
        if (history) history.push('/Orders');
    }

    render() {
        const { classes, mediaQuery } = this.props;
        const fullTitle = 'Farmar - Farm Fresh Fruits and Vegetables';
        const shortTitle = 'Farmar Vegetables';
        
        return (
            <div className={classes.root}>
                <CssBaseline />
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar className="header-color">
                        { !mediaQuery &&
                        <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={this.handleDrawerClose}
                            className={classes.iconColor}> <MenuIcon />
                        </IconButton> }
                        <img src={FarmarLogo} height={40} alt="Logo" />
                        <Typography variant="h6" className={classes.alignment}>                                                       
                            {/* <span className="header-font">                                
                                { mediaQuery ? fullTitle : shortTitle }
                            </span> */}
                        </Typography>
                        <div>                            
                            <Button color="primary" className={classes.btnText} onClick={this.redirectToDashboard}>
                                <AppsIcon className={classes.leftIcon} />
                                Dashboard
                            </Button>

                            { mediaQuery &&
                            <IconButton aria-label="account of current user" aria-controls="menu-appbar"
                                aria-haspopup="true" onClick={this.handleMenu} color="inherit">
                                <AccountCircle className={classes.iconColor} />
                            </IconButton> }

                            { mediaQuery &&
                            <span className={classes.textColor}>{sessionStorage.getItem('loggedInUser')}</span> }
                            { mediaQuery &&
                            <Button color="primary" className={classes.btnText} onClick={this.logOut}>
                                <PowerSettingsNewIcon className={classes.leftIcon} />
                                Logout
                            </Button> }
                        </div>
                    </Toolbar>
                </AppBar>

                <Drawer
                    variant="permanent"
                    className=
                    { mediaQuery ?
                        clsx(classes.drawer, {
                            [classes.drawerOpen]: this.state.open,
                            [classes.drawerClose]: !this.state.open,
                        }) :
                        clsx(classes.drawer, {
                            [classes.drawerShow]: !this.state.open,
                            [classes.drawerHide]: this.state.open,
                        })
                    }
                    classes=
                    { mediaQuery ?
                        {
                            paper: clsx({
                                [classes.drawerOpen]: this.state.open,
                                [classes.drawerClose]: !this.state.open,
                            }),
                        } :
                        {
                            paper: clsx({
                                [classes.drawerShow]: !this.state.open,
                                [classes.drawerHide]: this.state.open,
                            }),
                        }
                    } >
                    
                    <div className={classes.toolbar}>
                        {this.state.open ?
                            <IconButton onClick={this.handleDrawerClose}>
                                < ChevronLeftIcon className="drawerItems" />
                            </IconButton> : <IconButton onClick={this.handleDrawerOpen}>
                                < MenuIcon className="drawerItems" />
                            </IconButton>}
                    </div>
                    <List style={{ marginLeft: 5 }}>

                        {/* Products Management */}
                        { sessionStorage.getItem('loggedInUserRole') !== 'Sales Officer' && (
                        <ListItem button onClick={this.handleProducts}>
                            <Tooltip title="Products">
                                <BubbleChartIcon className="drawerItems" />
                            </Tooltip>
                            <ListItemText className="drawerItemsText" primary='Products' />
                            {this.state.openProducts ? <IconExpandLess className="drawerItems" /> : <IconExpandMore className="drawerItems" />}
                        </ListItem> )}
                        
                        <Collapse in={this.state.openProducts} timeout="auto" unmountOnExit> 
                            <Divider />
                            <List component="div" disablePadding>
                                <ListItem button onClick={this.redirectToCategories}>
                                    {/* <Tooltip title="Categories">
                                        <CategoryIcon className="drawerItems" />
                                    </Tooltip> */}
                                    <ListItemText inset className="drawerItems" primary='Add Category' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToProducts}>
                                    <ListItemText inset className="drawerItems" primary='Add Product' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToProductHistory}>
                                    <ListItemText inset className="drawerItems" primary='Product Price Hist' />
                                </ListItem>
                            </List>
                        </Collapse>
                        
                        {/* Vendor Management */}
                        { sessionStorage.getItem('loggedInUserRole') !== 'Sales Officer' && (
                        <ListItem button onClick={this.handleVendors}>
                            <Tooltip title="Vendors">
                                <PersonAddIcon className="drawerItems" />
                            </Tooltip>
                            <ListItemText className="drawerItemsText" primary='Vendors' />
                            {this.state.openVendors ? <IconExpandLess className="drawerItems" /> : <IconExpandMore className="drawerItems" />}
                        </ListItem> )}
                        <Collapse in={this.state.openVendors} timeout="auto" unmountOnExit> 
                            <Divider />
                            <List component="div" disablePadding>
                                <ListItem button onClick={this.redirectToVendorTypes}>
                                    <ListItemText inset className="drawerItems" primary='Vendor Types' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToAddVendors}>
                                    <ListItemText inset className="drawerItems" primary='Add Vendors' />
                                </ListItem>
                            </List>
                        </Collapse>

                        {/* Stock Management */}
                        { sessionStorage.getItem('loggedInUserRole') !== 'Sales Officer' && (
                        <ListItem button onClick={this.handleStocks}>
                            <Tooltip title="Stocks">
                                <PlaylistAddIcon className="drawerItems" />
                            </Tooltip>
                            <ListItemText className="drawerItemsText" primary='Stocks' />
                            {this.state.openStocks ? <IconExpandLess className="drawerItems" /> : <IconExpandMore className="drawerItems" />}
                        </ListItem> )}
                        <Collapse in={this.state.openStocks} timeout="auto" unmountOnExit> 
                            <Divider />
                            <List component="div" disablePadding>
                                <ListItem button onClick={this.redirectToAddStocks}>
                                    <ListItemText inset className="drawerItems" primary='Add Stocks' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToStocksOutstanding}>
                                    <ListItemText inset className="drawerItems" primary='Stocks Outstanding' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToGradeAStocks}>
                                    <ListItemText inset className="drawerItems" primary='Grade A Stocks' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToGradeBStocks}>
                                    <ListItemText inset className="drawerItems" primary='Grade B Stocks' />
                                </ListItem>
                            </List>
                        </Collapse>

                        {/* Customer Management */}
                        { sessionStorage.getItem('loggedInUserRole') !== 'Sales Officer' && (
                        <ListItem button onClick={this.handleCustomers}>
                            <Tooltip title="Customers">
                                <PeopleIcon className="drawerItems" />
                            </Tooltip>
                            <ListItemText className="drawerItemsText" primary='Customers' />
                            {this.state.openCustomers ? <IconExpandLess className="drawerItems" /> : <IconExpandMore className="drawerItems" />}
                        </ListItem> )}
                        <Collapse in={this.state.openCustomers} timeout="auto" unmountOnExit> 
                            <Divider />
                            <List component="div" disablePadding>
                                <ListItem button onClick={this.redirectToAddCustomers}>
                                    <ListItemText inset className="drawerItems" primary='Add Customers' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToManageCustomers}>
                                    <ListItemText inset className="drawerItems" primary='Manage Customers' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToCustomersOTP}>
                                    <ListItemText inset className="drawerItems" primary='Customers OTP' />
                                </ListItem>
                            </List>
                        </Collapse>

                        {/* Order Management */}
                        <ListItem button onClick={this.handleOrders}>
                            <Tooltip title="Orders">
                                <ShoppingCartIcon className="drawerItems" />
                            </Tooltip>
                            <ListItemText className="drawerItemsText" primary='Orders' />
                            {this.state.openOrders ? <IconExpandLess className="drawerItems" /> : <IconExpandMore className="drawerItems" />}
                        </ListItem>
                        <Collapse in={this.state.openOrders} timeout="auto" unmountOnExit> 
                            <Divider />
                            <List component="div" disablePadding>
                                <ListItem button onClick={this.redirectToCreateOrders}>
                                    <ListItemText inset className="drawerItems" primary='Create Orders' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToManageOrders}>
                                    <ListItemText inset className="drawerItems" primary='Manage Orders' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToOrderSummary}>
                                    <ListItemText inset className="drawerItems" primary='Order Summary' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToAssignRoutes}>                                
                                    <ListItemText inset className="drawerItems" primary='Assign Routes' />
                                </ListItem>
                            </List>
                        </Collapse>

                        {/* Payment Management */}
                        { sessionStorage.getItem('loggedInUserRole') !== 'Sales Officer' && (
                        <ListItem button onClick={this.handlePayments}>
                            <Tooltip title="Payments">
                                <PaymentIcon className="drawerItems" />
                            </Tooltip>
                            <ListItemText className="drawerItemsText" primary='Payments' />
                            {this.state.openPayments ? <IconExpandLess className="drawerItems" /> : <IconExpandMore className="drawerItems" />}
                        </ListItem>)}
                        <Collapse in={this.state.openPayments} timeout="auto" unmountOnExit> 
                            <Divider />
                            <List component="div" disablePadding>                                
                                <ListItem button onClick={this.redirectToManagePayments}>
                                    <ListItemText inset className="drawerItems" primary='Manage Payments' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToSalesOfficerBoard}>
                                    <ListItemText inset className="drawerItems" primary='Sales Officers Board' />
                                </ListItem>
                            </List>
                        </Collapse>

                        {/* Reports */}
                        { sessionStorage.getItem('loggedInUserRole') !== 'Sales Officer' && (
                        <ListItem button onClick={this.handleReports}>
                            <Tooltip title="Reports">
                                <BarChartIcon className="drawerItems" />
                            </Tooltip>
                            <ListItemText className="drawerItemsText" primary='Reports' />
                            {this.state.openReports ? <IconExpandLess className="drawerItems" /> : <IconExpandMore className="drawerItems" />}
                        </ListItem>)}
                        <Collapse in={this.state.openReports} timeout="auto" unmountOnExit> 
                            <Divider />
                            <List component="div" disablePadding>
                                <ListItem button onClick={this.redirectToProductSales}>
                                    <ListItemText inset className="drawerItems" primary='Product Sales' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToCustomerOrders}>
                                    <ListItemText inset className="drawerItems" primary='Customer Orders' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToOrders}>
                                    <ListItemText inset className="drawerItems" primary='Daily Orders' />
                                </ListItem>
                            </List>
                        </Collapse>

                        {/* Configurations */}
                        { sessionStorage.getItem('loggedInUserRole') !== 'Sales Officer' && (
                        <ListItem button onClick={this.handleConfigurations}>
                            <Tooltip title="Configurations">
                                <SettingsIcon className="drawerItems" />
                            </Tooltip>
                            <ListItemText className="drawerItemsText" primary='Configurations' />
                            {this.state.openConfigurations ? <IconExpandLess className="drawerItems" /> : <IconExpandMore className="drawerItems" />}
                        </ListItem> )}
                        <Collapse in={this.state.openConfigurations} timeout="auto" unmountOnExit> 
                            <Divider />
                            <List component="div" disablePadding>
                                <ListItem button onClick={this.redirectToOrderPickupDetails}>
                                    <ListItemText inset className="drawerItems" primary='Settings' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToNotifications}>
                                    <ListItemText inset className="drawerItems" primary='Notifications' />
                                </ListItem>
                                <ListItem button onClick={this.redirectToUserManagement}>
                                    <ListItemText inset className="drawerItems" primary='User Management' />
                                </ListItem>
                            </List>
                        </Collapse>

                        { !mediaQuery &&
                        <ListItem button onClick={this.logOut}>
                            <Tooltip title="Logout">
                                <PowerSettingsNewIcon className="drawerItems" />
                            </Tooltip>
                            <ListItemText className="drawerItemsText" primary='Logout' />
                        </ListItem> }
                    </List>
                </Drawer>
            </div>
        );
    }
}

export default withRouter(withStyles(useStyles)(withMediaQuery('(min-width:600px)')(NavMenu)))