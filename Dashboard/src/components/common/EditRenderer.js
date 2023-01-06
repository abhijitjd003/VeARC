import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

export default class EditRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = { }
        this.editRowData = this.editRowData.bind(this);
    }

    editRowData() {
        this.props.context.componentParent.editGridRow(this.props.node.data);
    }

    render() {
        return (
            <span> 
                {
                    this.props.data.Status !== 'Delivered' && this.props.data.Status !== 'Cancelled' &&
                    <IconButton color="primary" onClick={this.editRowData} style={{ color: '#02a959' }}>
                        <EditIcon />
                    </IconButton>
                }
            </span>
        );
    }
}