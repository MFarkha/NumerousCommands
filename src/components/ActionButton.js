import React from "react";

const ActionButton = ({name, iconClass, action}) => {
    return (
        <>
            <button id={name} type="button" className="btn btn-primary btn-round" onClick={action}>
                <i className={iconClass} onClick={action}></i>
                <label htmlFor={name}>{name}</label>
            </button>
        </>
    )
}

export default ActionButton;