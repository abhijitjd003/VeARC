import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

export default class ActionRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }

        this.editRowData = this.editRowData.bind(this);        
        this.deleteRowData = this.deleteRowData.bind(this);        
    }

    editRowData() {
        this.props.context.componentParent.editGridRow(this.props.node.data);
    }

    deleteRowData() {
        this.props.context.componentParent.showConfirmPopup(this.props.node.data);
    }

    render() {
        return (
            <span>                
                <IconButton color="primary" onClick={this.editRowData} style={{ color: '#02a959' }}>
                    <EditIcon />
                </IconButton>                    
                <IconButton color="secondary" onClick={this.deleteRowData} style={{ color: '#e64226' }}>
                    <DeleteIcon />
                </IconButton>
            </span>
        );
    }
}