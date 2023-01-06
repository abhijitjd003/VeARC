import React, { Component } from 'react';
import clsx from 'clsx';
import '../../components/common/Common.css';
import {
    Button, TextField, Grid, withStyles, AppBar, Toolbar, CssBaseline,
    Typography, useMediaQuery
} from '@material-ui/core';
import '../../components/common/CommonModal.css';
import { withRouter } from 'react-router-dom';
import Loader from '../../components/loader/Loader';
import api from '../../components/common/APIValues';
import FarmarLogo from '../../components/common/farmar-logo.jpeg';

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
    },
    appBarShift: {
        marginLeft: 0,
        width: `calc(100% - ${0}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
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
    topMargin: {
        marginTop: 40,
    },
    backColor: {
        backgroundColor: '#347f58'
    },
    customButton: {
        borderRadius: '8px',
        fontSize: 12, 
        height: '2.1rem',
        backgroundColor: "#2b494b",
        "&:hover": {
            backgroundColor: "#2b494b"
        },
        "&:disabled": {
            backgroundColor: "rgba(0, 0, 0, 0.12)"
        },
    },
});

const withMediaQuery = (...args) => Component => props => {
    const mediaQuery = useMediaQuery(...args);    
    return <Component mediaQuery={mediaQuery} {...props} />;
};

const validateForm = (errors) => {
    let valid = true;
    Object.keys(errors).map(function (e) {
        if (errors[e].length > 0) {
            valid = false;
        }        
    });
    return valid;
}

const validEmailRegex = RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false, email: null, password: null, errorMessage: null, loading: false,
            errors: {
                email: '',
                password: '',
            }
        };
        this.openLogin = this.openLogin.bind(this);
        this.closeLogin = this.closeLogin.bind(this);
        this.popupOnClose = this.popupOnClose.bind(this);
    }

    openLogin() {
        this.setState({ open: true });
    }
    closeLogin() {
        let errors = this.state.errors;
        errors.email = errors.password = '';
        this.setState({ errors, open: false, errorMessage: null });
    }
    popupOnClose() { }

    loginToDashboard = (event) => {
        event.preventDefault();
        if (validateForm(this.state.errors) && this.state.email && this.state.password) {
            this.setState({ loading: true });
            sessionStorage.setItem('loggedInUser', this.state.email)
            const { history } = this.props;
            if (history) history.push('/home/categories');            
        } else {
            let errors = this.state.errors;
            if (!this.state.email) {
                errors.email = 'Please enter email address';
            }
            if (!this.state.password) {
                errors.password = 'Please enter password';
            }
            this.setState({ errors, errorMessage: null });
        }
    }

    validateUser(email, password) {
        var values = { Email: email, Password: password };
        let partialUrl = api.URL;
        fetch(partialUrl + 'Home/ValidateUser', {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(values),
            headers: { 'Content-Type': 'application/json' }
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson) {                                        
                    sessionStorage.setItem('loggedInUser', this.state.email)
                    sessionStorage.setItem('loggedInUserRole', responseJson)
                    const { history } = this.props;
                    if (history) history.push('/Dashboard');
                }
                else {
                    this.setState({
                        errorMessage: 'Invalid email or password',
                        loading: false, email: null, password: null,
                    });
                }
            })
    }

    handleChange = (event) => {
        event.preventDefault();
        const { name, value } = event.target;
        let errors = this.state.errors;

        switch (name) {
            case 'email':
                this.state.email = value;
                errors.email = value.length <= 0
                ? 'Please enter email address' : !validEmailRegex.test(value) ? 'Email address is not valid' : '';
                break;
            case 'password':
                this.state.password = value;
                errors.password = value.length <= 0
                    ? 'Please enter password' : '';
                break;
            default:
                break;
        }
        this.setState({ errors, [name]: value });
    }

    render() {
        const { classes, mediaQuery } = this.props;
        const title = 'EVENT MAGNET';
        const col6 = mediaQuery ? 6 : 12;
        const col3 = mediaQuery ? 6 : 3;

        return (
            <div>
                <div className={classes.root}>
                    <CssBaseline />
                    <AppBar style={{ backgroundColor: 'white' }}
                        position="fixed"
                        className={clsx(classes.appBar, {
                            [classes.appBarShift]: this.state.open,
                        })}>
                        <Toolbar className="header-color">
                            <Typography variant="h6" className={classes.alignment}>
                                <span className="header-font">                                    
                                    { title }
                                </span>
                            </Typography>
                        </Toolbar>
                    </AppBar>
                </div>

                {this.state.loading ? (
                    <Loader />
                ) : (
                        <div>
                            <div className="home-body">     
                            </div>

                            <Grid container spacing={0}>
                                { mediaQuery ?
                                (<Grid item xs={col6}>                                    
                                    <Grid container spacing={0}>
                                        <Grid item xs={col3}>                                            
                                        </Grid>
                                        <Grid item xs={6}>
                                            <img src={FarmarLogo} alt="Logo" />
                                        </Grid>
                                        <Grid item xs={col3}>                                            
                                        </Grid>
                                    </Grid>
                                </Grid>) : (
                                <Grid item xs={col6} style={{ textAlign: 'center' }}>
                                    <img src={FarmarLogo} alt="Logo" />
                                </Grid>
                                )}
                                <Grid item xs={col6} style={{ marginTop: 32, marginLeft: mediaQuery? 0 : 20, marginRight: mediaQuery? 0 : 20 }}>
                                    <Grid container spacing={2}>                                        
                                        <Grid item xs={col6}>                                            
                                            <TextField fullWidth name="email" label="Email" required size="small"
                                                onChange={this.handleChange} noValidate value={this.state.email}
                                                variant="outlined" style={{ backgroundColor: '#e7e7e7' }} />
                                            {this.state.errors.email.length > 0 &&
                                                <span className='error'>{this.state.errors.email}</span>}
                                        </Grid>
                                        <Grid item xs={col6}></Grid>
                                        <Grid item xs={col6}>
                                            <TextField fullWidth name="password" label="Password" required size="small"
                                                onChange={this.handleChange} noValidate value={this.state.password} type="password"
                                                variant="outlined" style={{ backgroundColor: '#e7e7e7' }} />
                                            {this.state.errors.password.length > 0 &&
                                                <span className='error'>{this.state.errors.password}</span>}
                                        </Grid>
                                        <Grid item xs={col6}></Grid>
                                        <Grid item xs={col6}>
                                            <Button fullWidth variant="contained" size="small" className={classes.customButton}
                                                color="primary" onClick={this.loginToDashboard}>Login</Button>
                                        </Grid>
                                        <Grid item xs={col6}></Grid>
                                        {
                                            this.state.errorMessage &&
                                            <Grid item xs={col6} className='error-main'>{this.state.errorMessage}</Grid>
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </div>
                    )}
            </div>
        );
    }
}

export default withRouter(withStyles(useStyles)(withMediaQuery('(min-width:600px)')(Home)))