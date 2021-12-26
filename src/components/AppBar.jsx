import React from "react";
import PropTypes from "prop-types";
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';

const MemoAppBar = React.memo(function AppBar(props) {
    const { account, onLogout } = props;
    // console.log('--- render AppBar ---');

    return (<div className="app-bar">
        <div className="app-title">{`歡迎來到 ${account} 部落格`}</div>
        <div className="app-account">
            <div className="app-icon">
                <AccountCircleRoundedIcon style={{ fontSize: '26px' }} />
            </div>
            {`Hi, ${account}`}
        </div>
        <div className="app-logout" onClick={onLogout}>登出</div>
    </div>);
});

MemoAppBar.propTypes = {
    account: PropTypes.string,
    onLogout: PropTypes.func
};

export default MemoAppBar;