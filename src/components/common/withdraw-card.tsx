import "./../../App.css";

export const WithdrawCard = (props:any) => {
    return (
        <div className="card border-0 shadow-sm my-3" style={{ backgroundColor: "#27DEBF" }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <p className="fontsize16 mb-0">
              {props?.title}
            </p>
            <p className="withdrawBth mb-0 px-3 py-2" onClick={props.onClick} >
                {props.buttonText}
            </p>
          </div>
        </div>
      </div>
    );
  };