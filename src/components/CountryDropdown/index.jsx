import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import { compose, withURLSearchParams } from 'utils';
import { withAPI } from 'api';
import { countryCodeCountries } from './countries'

const addCountryNames = ( countryCodeCounts ) => countryCodeCounts
	.map( ( [ countryCode, count ] ) => ( { key: countryCodeCountries[countryCode], value: countryCode, text: countryCodeCountries[countryCode], count: count } ) )
	.sort( ( { count: countA }, { count: countB } ) => countB - countA /* desc */ );

const CountryFilterDropdown = ( { getCountries: getCountriesFromAPI, setParam } ) => {
	const [ countries, setCountries ] = useState( [] );

	useEffect( () => {
		const getCountries = async () => {
			const countryCodeCounts = await getCountriesFromAPI();
			const countryValues = addCountryNames( countryCodeCounts );
			setCountries( countryValues );
		};
		getCountries();
	}, [ getCountriesFromAPI ] );

	return (
		<div className="container">
			<h4>Country:</h4>
			<Dropdown
				clearable
				fluid
				options={countries}
				onChange={( _, data ) => setParam( 'country', data.value )}
				placeholder="Country"
				search
				selection
			/>
		</div>
	);
};

CountryFilterDropdown.propTypes = {
	getCountries: PropTypes.func.isRequired,
	setParam: PropTypes.func.isRequired,
};

// <div class="ui segment"><i class="ae flag"></i><i class="france flag"></i><i class="myanmar flag"></i></div>

export default compose( withAPI, withURLSearchParams )( CountryFilterDropdown );
