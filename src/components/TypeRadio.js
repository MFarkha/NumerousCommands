import React from "react";

const TypeRadio = ({SelectType, type}) => {
    return (
        <div className="form-check-radio">
            <label className="form-check-label">
            <input onChange={SelectType} className="form-check-input" type="radio" name="typesRadio" id={type} value={type}/> {type}
            <span className="form-check-sign"></span>
            </label>
        </div>
    )
} 
const TypesRadio = ({SelectType}) => {
    const types = ['trivia', 'math', 'year']
    return (
        <>
        { types.map( t => <TypeRadio key={t} SelectType={SelectType} type={t} />) }
        </>
    );
}

export default TypesRadio;