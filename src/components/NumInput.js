import React from "react";

const NumInput = ( {EnterNumber, ChangeNumber, ClickButton} ) => {
    return (
      <>
        <div className="row">
            <div className="col-sm-3">
              <div className="form-group">
                <input
                  className="form-control"
                  type="number"
                  name="inputnumber"
                  placeholder="Type a number"
                  onKeyDown={EnterNumber}
                  onChange={ChangeNumber}
                />
              </div>
            </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            <button type="button" className="btn btn-info btn-round" onClick={ClickButton}>Request!</button>
          </div>
        </div>
      </>
    );
}

export default NumInput;