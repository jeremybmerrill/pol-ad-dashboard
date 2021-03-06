import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { Form, Loader } from 'semantic-ui-react';
import styles from './Login.module.css';

const cx = classnames.bind( styles );

const Login = ( { handleChange, loading, onSubmit } ) => {
	if ( loading ) {
		return (
			<Loader active={loading} />
		);
	}

	return (
		<div className={cx( 'container' )}>
			<Form onSubmit={onSubmit}>
				<Form.Field>
					<label>Username</label>
					<Form.Input onChange={handleChange( 'user' )} />
				</Form.Field>
				<Form.Field>
					<label>Password</label>
					<Form.Input type="password" onChange={handleChange( 'pass' )} />
				</Form.Field>
				<Form.Button>Submit</Form.Button>
			</Form>
		</div>
	);
};

Login.propTypes = {
	handleChange: PropTypes.func.isRequired,
	loading: PropTypes.bool.isRequired,
	onSubmit: PropTypes.func.isRequired,
};

export default Login;
