import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

export default class EditRowRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = { }
        this.editRowData = this.editRowData.bind(this);
    }

    editRowData() {
        this.props.context.componentParent.editGridRow(this.props.node.rowIndex);
    }

    render() {
        return (
            <span>                
                <IconButton color="primary" onClick={this.editRowData}>
                    <EditIcon />
                </IconButton>
            </span>
        );
    }
}