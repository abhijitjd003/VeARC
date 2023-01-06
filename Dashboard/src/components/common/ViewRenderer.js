import React, { Component } from 'react';
import Link from '@material-ui/core/Link';

export default class ViewRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = { }
        this.viewRowData = this.viewRowData.bind(this);
    }

    viewRowData() {
        this.props.context.componentParent.viewRowData(this.props.node.data);
    }

    render() {
        const action = this.props.data.ShopId ? "View Images" : "View Summary";

        return (
            <span>                
                <Link component="button" variant="body2" onClick={ this.viewRowData }>
                    {action}
                </Link>                
            </span>
        );
    }
}