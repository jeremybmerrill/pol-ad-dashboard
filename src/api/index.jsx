import React from 'react';
import { DEFAULT_MIN_POLIPROB, DEFAULT_TO_SHOW_ONLY_POLITICAL } from '../components/constants'

// const API_URL = (process.env.NODE_ENV == 'development' || window.location.href.indexOf("localhost:") > -1) ? 'http://localhost:5000' : 'https://adobserver.ad-observatory.com';
const API_URL = window.location.origin;

const AuthContext = React.createContext();


class API extends React.Component {
	constructor( props ) {
		super( props );
		this.baseURL = API_URL;
		this.state = {
			loading: false,
		};
	}

	async get( url ) {
		const { cred } = this.state;
		const res = await fetch( url, {
			method: 'GET',
			credentials: 'include'
			// headers: {
			// 	// TODO - plug in actual auth
			// 	Authorization: `Basic ${cred}`,
			// 	'Content-Type': 'application/json',
			// },
		} ).then((response) => {
		    if (response.status == 401) {
          // Don't redirect if already on login page.
          if (window.location.pathname != '/login') {
            const login_url = new URL(url);
            login_url.pathname = "/login"
            window.location = login_url.toString()  ; // redirect us to the API URL, which'll send us to the login URL.
          }
          return;
        }
		    return response;
		});
		const data = res.json();
		return data;
	}

	getAd = ( adId ) => this.get( `${this.baseURL}/aoapi/ads_by_text/${adId}` );

	getAdByTextHash = ( text_hash ) => this.get( `${this.baseURL}/aoapi/ads_by_text/${encodeURIComponent( text_hash )}.json` );

	getAdByAdId = (ad_id) => this.get(`${this.baseURL}/aoapi/ads_by_ad_id/${encodeURIComponent( ad_id )}`)

	getTopics = () => this.get( `${this.baseURL}/aoapi/topics.json` );

	getCountries = () => this.get(`${this.baseURL}/aoapi/countries.json`);

	getSummaryData = ( params = {} ) => {
		const parsedParams = new URLSearchParams();
		Object.entries( params ).filter(([key, val]) => val).forEach(([key, val]) => parsedParams.set(key, val))
		return this.get( `${this.baseURL}/aoapi/pivot.json?${parsedParams}` );
	}

	handleChange = ( key ) => ( _, { value } ) => this.setState( { [key]: value } );

	search = ( params = {} ) => {
		const { poliprobMin = DEFAULT_TO_SHOW_ONLY_POLITICAL ? DEFAULT_MIN_POLIPROB : 0 , poliprobMax = 100 } = params;
		const parsedParams = Object.keys( params ).map( param => `${param}=${params[param].map((p) => encodeURIComponent(p)).join( ',' )}` ).join( '&' );
		return this.get( `${this.baseURL}/aoapi/ads/search.json?${parsedParams}&poliprob=[${poliprobMin},${poliprobMax}]` );
	}

	render() {
		const { loading, loggedIn } = this.state;
		const baseProps = {
			getAd: this.getAd,
			getAdvertiserByName: this.getAdvertiserByName,
			getAdvertiserByPageID: this.getAdvertiserByPageID,
			getPayerByName: this.getPayerByName,
			getAdByTextHash: this.getAdByTextHash,
			getAdByAdId: this.getAdByAdId,
			getTopics: this.getTopics,
			getCountries: this.getCountries,
			getSummaryData: this.getSummaryData,
			search: this.search,
		};

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
