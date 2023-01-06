import React, { Component } from "react";
import { css } from "@emotion/core";
import GridLoader from "react-spinners/GridLoader";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
  margin-top: 20%;
`;

class Loader extends Component {
    render() {
        return (
            <div className="sweet-loading">
                <GridLoader
                    css={override}
                    size={15}
                    color="#2b494b"
                />
            </div>
        );
    }
}

export default Loader;