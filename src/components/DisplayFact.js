import React from "react";

const DisplayFact = ({fact, date}) => {
    return (
        <>
            <div className="title">
                <h4>The fun fact</h4>
            </div>
            <div className="typography-line">
                <h4>
                <span className="note">{date}</span>
                <small>{fact}</small>
                </h4>
            </div>
        </>
    );
}

export default DisplayFact;