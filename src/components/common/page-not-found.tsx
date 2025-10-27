import imageNotFound from '../../assets/404 page not found.png';

function PageNotFound() {
    return (

        <div className='container'>
            <div className='row mt-5'>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    flexDirection: 'column',
                }}>
                    <img src={imageNotFound} alt="Page Not Found" height={'300rem'} width={'300rem'} />
                    <h4>
                    Oops!! Looks like you have entered a wrong URL. <br></br>
                    Please check again.
                    </h4>
                </div>

            </div>
        </div>
    );
}

export default PageNotFound;