import React from 'react';
import Login from 'components/Login';

const DASHBOARD_URL = process.env.NODE_ENV == 'development' ? 'http://localhost:3001' : 'https://dashboard-backend.ad-observatory.com';

const AuthContext = React.createContext();

class API extends React.Component {
	constructor( props ) {
		super( props );
		this.baseURL = DASHBOARD_URL;
		const existingUser = document.cookie.split( ';' ).find( val => val.includes( 'cred' ) );
		let cred = '';
		if ( existingUser ) {
			[ , cred ] = existingUser.split( '=' );
		}
		this.state = {
			cred,
			user: '',
			pass: '',
			loading: false,
			loggedIn: !!existingUser,
		};
	}

	setLogin = async () => {
		const { user, pass } = this.state;
		const cred = btoa( `${user}:${pass}` );
		await this.setState( { cred, loading: true } );
		const res = await this.getTopics();
		if ( !res.error || ( res.error && !res.error === 'Invalid Email or password.' ) ) {
			this.setState( { loggedIn: true, loading: false } );
			document.cookie = `cred=${cred}`;
		} else {
			this.setState( { loading: false } );
		}
	}

	async get( url ) {
		const { cred } = this.state;
		const res = await fetch( url, {
			method: 'GET',
			headers: {
				// TODO - plug in actual auth
				Authorization: `Basic ${cred}`,
				'Content-Type': 'application/json',
			},
		} );
		const data = res.json();
		return data;
	}

	getAd = ( adId ) => this.get( `${this.baseURL}/ads_by_text/${adId}` );

	getAdvertiserByName = ( name ) => this.get( `${this.baseURL}/pages_by_name/${encodeURIComponent( name )}.json` );

	getPayerByName = ( name ) => this.get( `${this.baseURL}/payers_by_name/${encodeURIComponent( name )}.json` );

	getAdByTextHash = ( text_hash ) => this.get( `${this.baseURL}/ads_by_text/${encodeURIComponent( text_hash )}.json` );

	getTopics = () => this.get( `${this.baseURL}/topics.json` );

	handleChange = ( key ) => ( _, { value } ) => this.setState( { [key]: value } );

	search = ( params = {} ) => {
		const { poliprobMin = 70, poliprobMax = 100 } = params;
		const parsedParams = Object.keys( params ).map( param => `${param}=${params[param].map((p) => encodeURIComponent(p)).join( ',' )}` ).join( '&' );
		return this.get( `${this.baseURL}/ads/search.json?${parsedParams}&poliprob=[${poliprobMin},${poliprobMax}]` );
	}

	render() {
		const { loading, loggedIn } = this.state;
		const baseProps = {
			getAd: this.getAd,
			getAdvertiserByName: this.getAdvertiserByName,
			getPayerByName: this.getPayerByName,
			getAdByTextHash: this.getAdByTextHash,
			getTopics: this.getTopics,
			search: this.search,
		};

		if ( !loggedIn ) {
			return (
				<Login
					handleChange={this.handleChange}
					loading={loading}
					onSubmit={this.setLogin}
				/>
			);
		}

		return (
			<AuthContext.Provider value={{ ...baseProps }}>
				{
					this.props.children
				}
			</AuthContext.Provider>
		);
	}
};

export const withAPI = WrappedComponent => () => (
	<AuthContext.Consumer>
		{
			props => <WrappedComponent {...props} />
		}
	</AuthContext.Consumer>
);

export default API;
