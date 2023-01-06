import React, { Component } from 'react';
import '../../components/common/Common.css';
import { Button, TextField, Grid, withStyles, Select, MenuItem, useMediaQuery, FormControl, 
    InputLabel } from '@material-ui/core';
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

class Categories extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categoryId: 0, categoryName: null, deactivate: false,
            errorMessage: null, loading: false, actionName: 'CREATE', userId: null,
            errors: {
                categoryName: '',
                isActive: '',
            },
            columnDefs: [                
                { headerName: 'Category Name', field: 'CategoryName', cellStyle: { 'text-align': "center" } },
                { headerName: 'Active', field: 'ActiveInd', cellStyle: { 'text-align': "center" } },
                { headerName: 'Created On', field: 'CreatedDate', cellStyle: { 'text-align': "center" } },
                { headerName: 'Created By', field: 'UserId', cellStyle: { 'text-align': "center" } },
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

    createCategory = (event) => {
        event.preventDefault();
        if (validateForm(this.state.errors) && this.state.categoryName) {
            this.setState({ loading: true });
            let newCategory = {};            
            newCategory.CategoryId = this.state.categoryId;
            newCategory.CategoryName = this.state.categoryName;
            newCategory.IsActive = this.state.isActive;
            newCategory.UserId = this.state.userId;
            this.createCategory(newCategory);
        } else {
            let errors = this.state.errors;
            if (!this.state.categoryName) {
                errors.categoryName = 'Please enter category name';
            }
            if (!this.state.isActive) {
                errors.isActive = 'Please select active option';
            }
            this.setState({ errors, errorMessage: null });
        }
    }

    loadCategories(){
        let partialUrl = api.URL;
        fetch(partialUrl + 'Category/GetCategories')
            .then(res => res.json())
            .then(result => this.setState({ rowData: result, loading: false }))
            .catch(err => console.log(err));
    }

    DeleteRecord(){
        this.setState({ loading: true })
        let CategoryId = this.state.categoryId;
        let partialUrl = api.URL;
        fetch(partialUrl + 'Category/DeleteCategory?CategoryId=' + CategoryId, {
            method: 'POST',
            mode: 'cors'
        }).then(data => {
            this.loadCategories();
            this.setState({ loading: false })
        });
    }

    componentDidMount() {
        let loggedInUser = sessionStorage.getItem('loggedInUser');

        if(loggedInUser) {
            //this.setState({ userId: loggedInUser, loading: true });
            //this.loadCategories();
        } else {
            const { history } = this.props;
            if (history) history.push('/Home');
        }
    }

    editGridRow = row => {
        this.setState({
            categoryId: row.CategoryId,
            categoryName: row.CategoryName,
            deactivate: row.IsDeactivate === 'YES' ? true : false,
            actionName: 'UPDATE'
        })
    };

    showConfirmPopup = row => {
        this.setState({ categoryId: row.CategoryId })
        this.refs.cnfrmModalComp.openModal();
    }

    createCategory(newCategory) {
        let partialUrl = api.URL;
        fetch(partialUrl + 'Category/CreateCategory', {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(newCategory),
            headers: { 'Content-Type': 'application/json' }
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson) {
                    this.loadProductCategories();
                    this.setState({ 
                        loading: false, actionName: 'CREATE', categoryId: 0, categoryName: null
                    });
                } else {
                    this.setState({ 
                        loading: false, actionName: 'CREATE', categoryId: 0, categoryName: null
                    });
                    var errorMsg = 'Category already exists.';
                    this.refs.errModalComp.openModal(errorMsg);
                }
            })
    }

    handleChange = (event) => {
        event.preventDefault();
        const { name, value } = event.target;
        let errors = this.state.errors;

        switch (name) {
            case 'categoryName':
                this.state.categoryName = value;
                errors.categoryName = value.length <= 0 ? 'Please enter category name' : '';
                break;
            case 'isActive':
                this.state.isActive = value;
                errors.isActive = value.length <= 0 ? 'Please select active option' : '';
                break;
            default:
                break;
        }
        this.setState({ errors, [name]: value });
    }

    _chkDeactivateChange = event => { this.setState({ deactivate: event.target.checked }); };

    render() {
        const { classes, mediaQuery } = this.props;
        
        return (
            <div>
                {this.state.loading ? (
                    <Loader />
                ) : (
                    <div>
                        <ErrorModal ref="errModalComp" />
                        <ConfirmModal ref="cnfrmModalComp" onClick={(e) => this.DeleteRecord(e)} />

                        <form onSubmit={this.loginToDashboard} noValidate>
                            <h2 className="header-text-color">Add Category</h2>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField fullWidth name="categoryName" label="Category Name" required size="small"
                                        onChange={this.handleChange} noValidate value={this.state.categoryName}
                                        variant="outlined" style={{ backgroundColor: '#e7e7e7' }} />
                                    {this.state.errors.categoryName.length > 0 &&
                                        <span className='error'>{this.state.errors.categoryName}</span>}
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth variant="outlined" required size="small">
                                        <InputLabel id="demo-simple-select-label">Active</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={this.state.isActive}
                                            label="Active"
                                            onChange={this.handleChange}                                
                                            style={{ backgroundColor: '#e7e7e7' }}
                                            name="isActive"
                                        >
                                            <MenuItem value='Y'>Yes</MenuItem>
                                            <MenuItem value='N'>No</MenuItem>
                                        </Select>
                                    </FormControl>
                                    
                                    { this.state.errors.isActive.length > 0 && 
                                        <span className='error'>{this.state.errors.isActive}</span> }
                                </Grid>
                                <Grid item>
                                    <Button className={classes.root} variant="contained"
                                        color="primary" onClick={this.createCategory} size="small">
                                        { this.state.actionName }
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button className={classes.customButtonInfo} variant="contained"
                                        color="primary" onClick={this.clearData} size="small">
                                        Clear
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>

                        <Grid container spacing={0}>
                            <Grid item xs={12}>
                                <div className="ag-theme-alpine" style={{ width: "100%", height: 350, marginTop: 10 }}>
                                    <AgGridReact
                                        columnDefs={this.state.columnDefs} rowData={this.state.rowData}
                                        onGridReady={this.onGridReady} defaultColDef={this.state.defaultColDef}
                                        frameworkComponents={this.state.frameworkComponents} context={this.state.context}
                                        pagination={true} gridOptions={this.gridOptions} paginationAutoPageSize={true}
                                        components={this.state.components} rowClassRules={this.state.rowClassRules} suppressClickEdit={true}
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

export default withRouter(withStyles(useStyles)(withMediaQuery('(min-width:600px)')(Categories)))