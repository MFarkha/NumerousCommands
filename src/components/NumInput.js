import React from "react";

const NumInput = ( {EnterNumber, ChangeNumber} ) => {
    return (
      <div className="col-sm-2">
        <div className="form-group">
          <input
            className="form-control"
            type="number"
            name="inputnumber"
            placeholder="number"
            onKeyDown={EnterNumber}
            onChange={ChangeNumber}
          />
        </div>
      </div>
    );
}

export default NumInput;