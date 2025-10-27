import PropTypes from 'prop-types';
import './loader.css';

const Loader = ({
  type = 'spinner',
  size = 'medium',
  color = '#007BFF',
  message = '',
  opacity = 0.6,
}) => {
  const loaderClass = `loader loader-${type} loader-${size}`;
  const styles = {
    borderColor: color,
    borderTopColor: 'transparent', // For spinner animation
  };

  return (
    <div
      className="dynamic-loader-container"
      style={{ backgroundColor: `rgba(255, 255, 255, ${opacity})` }}
    >
      <div className={loaderClass} style={styles}></div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
};

Loader.propTypes = {
  type: PropTypes.oneOf(['spinner', 'dots', 'bars']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  message: PropTypes.string,
  opacity: PropTypes.number, // Opacity for the loader background
};

export default Loader;
