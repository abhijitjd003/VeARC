import React, { Component } from 'react';
import NavMenu from './NavMenu';
import { withStyles } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';

const useStyles = theme => ({
    root: {
        display: 'flex',
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
        padding: theme.spacing(0, 5, 0, 5),
        backgroundColor: '#f6f6f6',
    },
    contentsm: {
        flexGrow: 1,
        padding: theme.spacing(0, 2, 0, 2),
        backgroundColor: '#f6f6f6',
    },
});

const withMediaQuery = (...args) => Component => props => {
    const mediaQuery = useMediaQuery(...args);    
    return <Component mediaQuery={mediaQuery} {...props} />;
};

class Layout extends Component {

    render() {
        const { classes, mediaQuery } = this.props;
        const cols = mediaQuery ? 3 : 12;

        return (
            <div>
                <div className={classes.root}>
                    <NavMenu />
                    <main className={ mediaQuery ? classes.content : classes.contentsm }>
                        <div className={classes.toolbar} />
                        {this.props.children}
                    </main>
                </div>
            </div>
        );
    }
}

export default withStyles(useStyles)(withMediaQuery('(min-width:600px)')(Layout))
