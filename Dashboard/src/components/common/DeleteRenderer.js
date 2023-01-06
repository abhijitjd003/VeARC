import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

export default class DeleteRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }

        this.deleteRowData = this.deleteRowData.bind(this);        
    }

    deleteRowData() {
        this.props.context.componentParent.showConfirmPopup(this.props.node.data);
    }

    render() {
        return (
            <span>
                <IconButton color="secondary" onClick={this.deleteRowData} style={{ color: '#e64226' }}>
                    <DeleteIcon />
                </IconButton>
            </span>
        );
    }
}