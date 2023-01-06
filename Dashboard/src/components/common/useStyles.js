const useStyles = theme => ({
    leftIcon: {
        marginRight: theme.spacing.unit,
    },
    topMargin: {
        marginTop: 16,
    },
    topMarginTab: {
        marginTop: 10,
    },
    topMarginSm: {
        marginTop: 5,
    },
    topMarginMd: {
        marginTop: 35,
    },
    root: {
        borderRadius: '8px',
        fontSize: 12, 
        height: '2.1rem',
        backgroundColor: "#2b494b",
        "&:hover": {
            backgroundColor: "#2b494b"
        },
        "&:disabled": {
            backgroundColor: "rgba(0, 0, 0, 0.12)"
        },
    },
    customButtonInfo: {
        borderRadius: '8px',
        fontSize: 12, 
        height: '2.1rem',
        color: '#f16623',
        backgroundColor: "#f9f9f9",
        "&:hover": {
            backgroundColor: "#f9f9f9"
        },
        "&:disabled": {
            backgroundColor: "rgba(0, 0, 0, 0.12)"
        },
    },
    rootEdit: {
        fontSize: 12, height: '2.1rem', marginTop: 35,
        backgroundColor: "#2b494b",
        "&:hover": {
            backgroundColor: "#2b494b"
        },
        "&:disabled": {
            backgroundColor: "rgba(0, 0, 0, 0.12)"
        },
    },
    rootCreate: {
        fontSize: 12, height: '2.1rem', marginTop: 30,
        backgroundColor: "#2b494b",
        "&:hover": {
            backgroundColor: "#2b494b"
        },
        "&:disabled": {
            backgroundColor: "rgba(0, 0, 0, 0.12)"
        },
    },
    rootModal: {
        fontSize: 12, height: '2.1rem',
        backgroundColor: "#2b494b",
        "&:hover": {
            backgroundColor: "#2b494b"
        },
        "&:disabled": {
            backgroundColor: "rgba(0, 0, 0, 0.12)"
        },
    },
    table: {
        minWidth: 300,
    },
    tabBar: {
        backgroundColor: "white", color: 'orangered'
    },
    tabLinks: {
        fontSize: 12, "&:hover": {
            textDecoration: 'none',
        },
    },
    tabLinksActive: {
        fontSize: 12, backgroundColor: "#347f58", color: 'white',
        "&:hover": {
            textDecoration: 'none',
        },
    },
    rootCard: {
        minWidth: 275, marginTop: 20,
      },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
      },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 20, marginRight: 20, marginLeft: 20
    },
    posGraph: {
        marginBottom: 0, marginRight: 10, marginLeft: 10, marginTop: 0
    },
    posBottom: {
        marginBottom: 20
    },    
    paper: {
        padding: theme.spacing(2),
        margin: 'auto',
        maxWidth: '100%',
        height: 600,
    },
    image: {
        width: 128,
        height: 128,
    },
    img: {
        margin: 'auto',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
    },
});

export {useStyles}