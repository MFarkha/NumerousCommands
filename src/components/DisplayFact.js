import React from "react";

const Spinner = ({status}) => {
    if (status) {
        return (
            <div className="spinner-grow spinner-grow-sm" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        )
    }
}

const DisplayFact = ({title, fact, source, action, recognizing}) => {
    return (
        <div className="col-sm-10">
            <div className="card card-nav-tabs">
                <div className="card-header card-header-success">
                    {title}
                    <Spinner status={recognizing}/>
                </div>
                <div className="card-body" onClick={action}>
                    <blockquote className="blockquote mb-0">
                    <p>{fact}</p>
                    <footer className="blockquote-footer">{source}<cite title="Source Title"> </cite></footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}

export default DisplayFact;