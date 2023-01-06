import React, { Component } from 'react';
import '../../components/common/Common.css';
import { Button, TextField, Grid, withStyles, Select, MenuItem, useMediaQuery } from '@material-ui/core';
import '../../components/common/CommonModal.css';
import { withRouter } from 'react-router-dom';
import Loader from '../../components/loader/Loader';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import ActionRenderer from '../../components/common/ActionRenderer';
import ConfirmModal from '../../components/modal/ConfirmModal';
import ErrorModal from '../../components/modal/ErrorModal';
import api from '../../components/common/APIValues';
import CreateIcon from '@material-ui/icons/Create';
import { useStyles } from '../../components/common/useStyles';

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

class UserManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: 0, fullName: null, email: null, mobileNo: null, role: '0', password: null,
            errorMessage: null, loading: false, actionName: 'CREATE',
            errors: {
                fullName: '',
                email: '',
                mobileNo: '',
                role: '',
                password: '',
            },
            columnDefs: [
                { headerName: 'Full Name', field: 'FullName', cellStyle: { 'text-align': "center" } },
                { headerName: 'Mobile No', field: 'MobileNo', cellStyle: { 'text-align': "center" } },                
                { headerName: 'Email', field: 'Email', cellStyle: { 'text-align': "center" } },
                { headerName: 'Password', field: 'Password', cellStyle: { 'text-align': "center" } },
                { headerName: 'Role', field: 'Role', cellStyle: { 'text-align': "center" } },
                { headerName: 'Actions', field: 'Actions', sorting: false, filter: false, cellRenderer: 'actionRenderer', cellStyle: { 'text-align': "center" } },
            ],
            context: { componentParent: this },
            frameworkComponents: { actionRenderer: ActionRenderer },
            rowData: [],
            defaultColDef: { flex: window.innerWidth <= 600 ? 0 : 1, width: 110, sortable: true, resizable: true, filter: true },
            rowClassRules: {
                'grid-row-even': function (params) { return params.node.rowIndex % 2 === 0; },
                'grid-row-odd': function (params) { return params.node.rowIndex % 2 !== 0; }
            },
        };
    }

    validateAllInputs(){
        if(this.state.fullName && this.state.email && this.state.mobileNo && this.state.role && this.state.password) {
                return true;
        }
        else{
            return false;
        }
    }

    create = (event) => {
        event.preventDefault();
        if (validateForm(this.state.errors) && this.validateAllInputs()) {
            this.setState({ loading: true });
            let newUser = {};            
            newUser.UserId = this.state.userId;
            newUser.FullName = this.state.fullName;
            newUser.Email = this.state.email;
            newUser.MobileNo = this.state.mobileNo;
            newUser.Role = this.state.role;
            newUser.Password = this.state.password;
            this.createUser(newUser);
        } else {
            let errors = this.state.errors;
            if (!this.state.fullName) {
                errors.fullName = 'Full name is required';
            }
            if (!this.state.email) {
                errors.email = 'Email is required';
            }
            if (!this.state.mobileNo) {
                errors.mobileNo = 'Mobile number is required';
            }
            if (!this.state.password) {
                errors.password = 'Password is required';
            }
            if (this.state.role === '0') {
                errors.role = 'Select role';
            }
            this.setState({ errors, errorMessage: null });
        }
    }

    loadUsers(){
        let partialUrl = api.URL;
        fetch(partialUrl + 'Home/GetUsers')
            .then(res => res.json())
            .then(result => this.setState({ rowData: result, loading: false }))
            .catch(err => console.log(err));
    }

    DeleteRecord(){
        let UserId = this.state.userId;
        let partialUrl = api.URL;
        fetch(partialUrl + 'Home/RemoveUser?UserId=' + UserId, {
            method: 'POST',
            mode: 'cors'
        }).then(data => {
            this.loadUsers();
        });
    }

    componentDidMount() {
        let loggedInUser = sessionStorage.getItem('loggedInUser');

        if(loggedInUser) {
            this.setState({ loading: true })
            this.loadUsers();
        } else {
            const { history } = this.props;
            if (history) history.push('/Home');
        }
    }

    editGridRow = row => {
        this.setState({
            userId: row.UserId,
            fullName: row.FullName,
            email: row.Email,
            mobileNo: row.MobileNo,
            password: row.Password,
            role: row.Role,
            actionName: 'UPDATE'
        })
    };

    showConfirmPopup = row => {
        this.setState({ userId: row.UserId })
        this.refs.cnfrmModalComp.openModal();
    }

    createUser(newUser) {
        let partialUrl = api.URL;
        fetch(partialUrl + 'Home/CreateUser', {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(newUser),
            headers: { 'Content-Type': 'application/json' }
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson) {
                    this.loadUsers();
                    this.setState({ 
                        loading: false, actionName: 'CREATE', userId: 0, fullName: null, email: null, mobileNo: null, role: '0', password: null,
                    });
                } else {
                    this.setState({ 
                        loading: false, actionName: 'CREATE', userId: 0, fullName: null, email: null, mobileNo: null, role: '0', password: null,
                    });
                    var errorMsg = 'Duplicate user found.';
                    this.refs.errModalComp.openModal(errorMsg);
                }
            })
    }

    handleChange = (event) => {
        event.preventDefault();
        const { name, value } = event.target;
        let errors = this.state.errors;

        switch (name) {
            case 'fullName':
                this.state.fullName = value;
                errors.fullName = value.length <= 0 ? 'Full name is required' : '';
                break;
            case 'mobileNo':
                this.state.mobileNo = value;
                errors.mobileNo = value.length <= 0 ? 'Mobile number is required' : !Number(value) ? 'Mobile number is not valid' : '';
                break;
            case 'email':
                this.state.email = value;
                errors.email = value.length <= 0 ? 'Email is required' : !validEmailRegex.test(value) ? 'Email is not valid' : '';
                break;            
            case 'password':
                this.state.password = value;
                errors.password = value.length <= 0 ? 'Password is required' : '';
                break;
            default:
                break;
        }
        this.setState({ errors, [name]: value });
    }

    onRoleChanged(e) {
        let Role = e.target.value; 
        this.setState({ role: Role });
        if(Role === '0'){
            this.state.errors.role = 'Select role';
        }else{
            this.state.errors.role = '';
        }
    };

    render() {
        const { classes, mediaQuery } = this.props;
        const col6 = mediaQuery ? 6 : 12;
        const col4 = mediaQuery ? 4 : 12;
        const col10 = mediaQuery ? 10 : 0;
        const col2 = mediaQuery ? 2 : 12;        
        
        return (
            <div>
                {this.state.loading ? (
                    <Loader />
                ) : (
                    <div>
                        <ErrorModal ref="errModalComp" />
                        <ConfirmModal ref="cnfrmModalComp" onClick={(e) => this.DeleteRecord(e)} />

                        <form onSubmit={this.loginToDashboard} noValidate>
                            <h2 className="header-text-color">User Management</h2>
                            <Grid container spacing={3}>
                                <Grid item xs={col6}>
                                    <TextField fullWidth required="true" name="fullName" id="txtFullName" label="Full Name"
                                        onChange={this.handleChange} noValidate value={this.state.fullName} 
                                        InputLabelProps={{ shrink: true, style: { fontSize: 18 } }}/>
                                    {this.state.errors.fullName.length > 0 &&
                                        <span className='error'>{this.state.errors.fullName}</span>}
                                </Grid>
                                <Grid item xs={col6}>
                                    <TextField fullWidth required="true" name="email" id="txtEmail" label="Email Address"
                                        onChange={this.handleChange} noValidate value={this.state.email} 
                                        InputLabelProps={{ shrink: true, style: { fontSize: 18 } }}/>
                                    {this.state.errors.email.length > 0 &&
                                        <span className='error'>{this.state.errors.email}</span>}
                                </Grid>                                
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={col4}>
                                    <TextField fullWidth required="true" name="mobileNo" id="txtMobileNo" label="Mobile Number"
                                        onChange={this.handleChange} noValidate value={this.state.mobileNo} 
                                        InputLabelProps={{ shrink: true, style: { fontSize: 18 } }}/>
                                    {this.state.errors.mobileNo.length > 0 &&
                                        <span className='error'>{this.state.errors.mobileNo}</span>}
                                </Grid>
                                <Grid item xs={col4}>
                                    <TextField fullWidth required="true" name="password" id="txtPassword" label="Password"
                                        onChange={this.handleChange} noValidate value={this.state.password} 
                                        InputLabelProps={{ shrink: true, style: { fontSize: 18 } }}/>
                                    {this.state.errors.password.length > 0 &&
                                        <span className='error'>{this.state.errors.password}</span>}
                                </Grid>
                                <Grid item xs={col4}>
                                    <Select fullWidth id="ddlRole" value={this.state.role} className="selectTopMargin"
                                        onChange={ (e)=> this.onRoleChanged(e) }>
                                        <MenuItem value="0">Choose Role</MenuItem>
                                        <MenuItem value="Admin">Admin</MenuItem>
                                        <MenuItem value="Sales Officer">Sales Officer</MenuItem>
                                        <MenuItem value="Delivery">Delivery</MenuItem>                                        
                                    </Select>
                                    {this.state.errors.role.length > 0 &&
                                        <span className='error'>{this.state.errors.role}</span>}
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={col10}>                                    
                                </Grid>
                                <Grid item xs={col2}>
                                    <Button fullWidth className={classes.root} variant="contained"
                                        color="primary" onClick={this.create}>
                                        <CreateIcon className={classes.leftIcon} />{ this.state.actionName }</Button>
                                </Grid>
                            </Grid>
                        </form>

                        <Grid container spacing={0}>
                            <Grid item xs={12}>
                                <div className="ag-theme-alpine" style={{ width: "100%", height: 450, marginTop: 10 }}>
                                    <AgGridReact
                                        columnDefs={this.state.columnDefs} rowData={this.state.rowData}
                                        onGridReady={this.onGridReady} defaultColDef={this.state.defaultColDef}
                                        frameworkComponents={this.state.frameworkComponents} context={this.state.context}
                                        pagination={true} gridOptions={this.gridOptions} paginationAutoPageSize={true}
                                        components={this.state.components} rowClassRules={this.state.rowClassRules} 
                                        suppressClickEdit={true}
                                    />
                                </div>
                            </Grid>                        
                        </Grid>
                    </div>
                    )}
            </div>
        );
    }
}

export default withRouter(withStyles(useStyles)(withMediaQuery('(min-width:600px)')(UserManagement)))