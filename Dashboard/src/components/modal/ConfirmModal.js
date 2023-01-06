import React, { Component } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import Popup from "reactjs-popup";
import { Button, InputLabel, Grid, withStyles } from '@material-ui/core';
import ConfirmationNumber from '@material-ui/icons/ConfirmationNumber';
import './Modal.css';
import PropTypes from 'prop-types';
import { useStyles } from '../common/useStyles';

// const useStyles = theme => ({
//     leftIcon: {
//         marginRight: theme.spacing.unit,
//     },
//     root: {
//         fontSize: 12, height: '2.1rem',
//         backgroundColor: "#0079c2",
//         "&:hover": {
//             backgroundColor: "#0079c2"
//         },
//         "&:disabled": {
//             backgroundColor: "rgba(0, 0, 0, 0.12)"
//         },
//     },
// });

class ConfirmModal extends Component {
    constructor(props) {
        super(props);
        this.state = { open: false, deleteConfirmMessage: '' };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.popupOnClose = this.popupOnClose.bind(this);
    }

    openModal() {
        let deleteMsg = 'Are you sure want to remove this record?';
        this.setState({
            open: true, deleteConfirmMessage: deleteMsg,
        });
    }

    closeModal() { this.setState({ open: false }); }
    popupOnClose() { }

    DeleteRecord = () => {        
        if (typeof this.props.onClick === 'function') {
            this.props.onClick();
            this.closeModal();
        }
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Popup contentStyle={{ width: "500px", height: "220px", borderRadius: "5px" }} open={this.state.open}
                    className="popup-modal-container-box" modal onOpen={e => this.popupOnClose(e)}
                    onClose={this.popupOnClose} lockScroll={true} closeOnDocumentClick={false}>
                    <div className="modal-custom">
                        <div className="header">Confirmation</div>
                        <div className="content-confirm">
                            <InputLabel>{this.state.deleteConfirmMessage}</InputLabel>
                        </div>
                        <Grid className="actions" container spacing={1}>
                            <Grid item xs={6}>
                            </Grid>
                            <Grid item xs={3}>
                                <Button className={classes.rootModal} color="primary" variant="contained" onClick={() => this.DeleteRecord()}>
                                    <ConfirmationNumber className={classes.leftIcon} /> Delete </Button>
                            </Grid>
                            <Grid item xs={3}>
                                <Button className={classes.rootModal} color="primary" variant="contained" onClick={this.closeModal}>
                                    <CloseIcon className={classes.leftIcon} /> Close </Button>
                            </Grid>
                        </Grid>
                    </div>
                </Popup>
            </div>
        );
    }
}

ConfirmModal.propTypes = {
    onClick: PropTypes.func
};

export default withStyles(useStyles)(ConfirmModal)