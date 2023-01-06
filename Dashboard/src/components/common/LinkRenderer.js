import React, { Component } from 'react';
import Link from '@material-ui/core/Link';

export default class LinkRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = { }
        this.viewRowData = this.viewRowData.bind(this);
        console.log(props.data);
    }

    viewRowData = (status) => {
        this.props.context.componentParent.viewRowData(this.props.node.data, status);
    }

    render() {
        const action = this.props.data.Status !== 'Delivered' && this.props.data.Status !== 'Approved' &&
                       this.props.data.Status !== 'Cancelled'? "View /" : "View Order";

        return (
            <span>
                <Link component="button" variant="body2" onClick={ () => this.viewRowData('view') }>
                    {action}
                </Link>
                {
                    this.props.data.Status !== 'Delivered' && this.props.data.Status !== 'Approved' &&
                    this.props.data.Status !== 'Cancelled' &&
                    <Link component="button" variant="body2" onClick={ () => this.viewRowData('edit') }>
                    &nbsp;Edit Order
                    </Link>
                }
            </span>
        );
    }
}