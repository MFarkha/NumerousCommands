import React from "react";

const ActionButton = ({name, iconClass, action}) => {
    return (
        <>
            <button type="button" className="btn btn-primary btn-round" onClick={action}>
                <i className={iconClass} onClick={action}></i>
                <label>{name}</label>
            </button>
        </>
    )
}

export default ActionButton;