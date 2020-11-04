import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withURLSearchParams } from 'utils';
import { Button, Divider, Icon, Label } from 'semantic-ui-react';
import classnames from 'classnames/bind';
import styles from './Targets.module.css';
import {friendlifyTargeting} from './transformTargeting'
const cx = classnames.bind( styles );

export const TargetFilters = ( { getParam } ) => {
	const targets = JSON.parse( getParam( 'targeting' ) );
	const formattedTargets = [];

	if ( !targets || !targets.length ) {
		return null;
	}

	for ( const targetParam of targets ) {
		const [ target, segment ] = targetParam;
		formattedTargets.push( { target, segment } );
	}

	return (
		<Fragment>
			<Divider />
			<div className={cx( 'search-targets' )}>
				<h4 className={cx( 'title' )}>Applied Targets:</h4>
				<WrappedTargets targets={formattedTargets} />
			</div>
		</Fragment>
	);
};

TargetFilters.propTypes = {
	getParam: PropTypes.func.isRequired,
};

const TargetButton = ( { isPresent, target, targetSearch, inAd } ) => {
	const { target: type, segment, count } = target;
	return (
		<div className={cx( 'button-group' )}>
			<div className={inAd ? cx('inad') : ''}>
			<Button.Group>
				{
					isPresent
						? (
							<Button className={cx('redx')} icon color="red" onClick={targetSearch( isPresent, type, segment )}>
								<Icon name="close" />
							</Button>
						) : null
				}
				<Button onClick={targetSearch( isPresent, type )} as="a" labelPosition="right">
					{
						count && <Label pointing="right">{count}</Label>
					}
					<Button>
						{target.target}
					</Button>
				</Button>
				{
					target.segment
						? (
							<Button color="olive" onClick={targetSearch( isPresent, type, segment )}>
								{target.segment}
							</Button>
						) : null
				}
			</Button.Group>
			</div>
		</div>
	);
};

// this is used in ads.
const UnwrappedAdTargeting = ({
	targets,
	getParam,
	setParam,
}) => {
	const parsedTargets = JSON.parse( getParam( 'targeting' ) ) || [];
	const formattedParsedTargets = parsedTargets.map( toFormat => ( { target: toFormat[0], segment: toFormat[1] } ) );

	const targetSearch = ( isPresent, type, segment ) => () => {
		let newTargets;
		if ( isPresent ) {
			// remove if we already have this target
			newTargets = parsedTargets.filter( parsedTarget => parsedTarget[1] ? ( parsedTarget[0] !== type || parsedTarget[1] !== segment ) : parsedTarget[0] !== type );
		} else {
			// otherwise add new target to list and push to history
			newTargets = parsedTargets.concat( [ [ type, segment ] ] );
		}
		setParam( 'targeting', newTargets.length ? JSON.stringify( newTargets ) : '' );
	};

	const subcategoryLookup = {
		// functions that take a targeting table row and output a list of objects like [{"target": "Some Kind of Targeting", "segment": "The Details"}, ...]
		// this is the equivalent of the category/subcategory thing from https://github.com/OnlinePoliticalTransparency/FacebookAdsAnalysis/blob/master/sql/unified_schema.sql#L621-L668
		// plus transformTargeting https://github.com/OnlinePoliticalTransparency/poladstransparency-17744/blob/master/src/utils/transformTargeting.js
		"LOCATION": (targeting) => [{"location_name": targeting["location_name"], "location_type": targeting["location_type"]}],
		"AGE_GENDER": (targeting) => [{'age_min': targeting["age_min"] + 12, 'age_max': targeting["age_max"] + 12, 'gender': targeting["gender"]}],
		"INTERESTS": (targeting) => [targeting["interests"]],

		"CUSTOM_AUDIENCES_LOOKALIKE": (targeting) => [{"match_keys": targeting["dfca_data"]["match_keys"], "ca_owner_name": targeting["dfca_data"]["ca_owner_name"]}],
		// "LOCALE": (targeting) => ,
		"CUSTOM_AUDIENCES_DATAFILE": (targeting) => [{"ca_owner_name": targeting["dfca_data"]["ca_owner_name"]}],

		"CUSTOM_AUDIENCES_ENGAGEMENT_PAGE": (targeting) => [targeting],
		"CUSTOM_AUDIENCES_WEBSITE": (targeting) => [targeting],
		"BCT": (targeting) => ["name", targeting["name"]],
		"CUSTOM_AUDIENCES_ENGAGEMENT_VIDEO": (targeting) =>  [targeting],
		"DYNAMIC_RULE": (targeting) =>  [targeting],
		"FRIENDS_OF_CONNECTION": (targeting) =>  [targeting],
		"CUSTOM_AUDIENCES_ENGAGEMENT_IG": (targeting) =>  [targeting],
		"CONNECTION": (targeting) =>  [targeting],
		"ED_STATUS": (targeting) =>  [targeting["edu_status"]],
		"RELATIONSHIP_STATUS": (targeting) =>  [targeting],
		"EDU_SCHOOLS": (targeting) =>  [targeting],
		"CUSTOM_AUDIENCES_MOBILE_APP": (targeting) =>  [targeting],
		"ACTIONABLE_INSIGHTS": (targeting) =>  [targeting],
		"WORK_JOB_TITLES": (targeting) =>  [targeting],
		"CUSTOM_AUDIENCES_ENGAGEMENT_EVENT": (targeting) =>  [targeting],
		"WORK_EMPLOYERS": (targeting) =>  [targeting],
		"CUSTOM_AUDIENCES_OFFLINE": (targeting) =>  [targeting],
		"CUSTOM_AUDIENCES_ENGAGEMENT_LEAD_GEN": (targeting) =>  [targeting],
		"COLLABORATIVE_AD": (targeting) =>  [targeting],

		// an initial attempt
		// "LOCATION": (targeting) => [{"target": "Location", "segment": targeting["location_name"]}, {"target": "Location Granularity", "segment": targeting["serialized_data"]["location_granularity"]}],
		// "AGE_GENDER": (targeting) => [{"target": "MinAge", "segment": targeting["age_min"] + 12}, targeting["age_max"] != 53 ? {"target": "MaxAge", "segment": targeting["age_max"] + 12} : null].filter((a) => a),
		// "INTERESTS": (targeting) => targeting["interests"].map((interest) => ({"target": "Interest", "segment": interest["name"]})),
		// "CUSTOM_AUDIENCES_LOOKALIKE": (targeting) => [{"target": "Lookalike", "segment": null}],
		// // "LOCALE": (targeting) => // boring!
		// "CUSTOM_AUDIENCES_DATAFILE": (targeting) => [{"target": "List", "segment": null}] // TODO: audience uploader

	}
	return (
		<div className={cx( 'container' )}>
			{
				targets.map((targeting) => {
					const subcategories = (subcategoryLookup[targeting["waist_ui_type"]] || ((a) => { return []}))(targeting);
					return subcategories.map((subcategory) => {
						return friendlifyTargeting(targeting["waist_ui_type"], subcategory).map(([target, segment]) => ({"target": target, "segment": segment }));
					});
				}).flat(2).map( ( target, idx ) => {
					const isPresent = formattedParsedTargets.some( item => target.target === item.target && target.segment === item.segment );
					return (
						<TargetButton key={`${target.segment}-${idx}`} target={target} isPresent={isPresent}  targetSearch={targetSearch}/>
					);
				} )
			}
		</div>
	);
}

// this is used in the search sidebar.
const Targets = ( {
	getParam,
	setParam,
	targets,
	inAd
} ) => {
	const parsedTargets = JSON.parse( getParam( 'targeting' ) ) || [];
	const formattedParsedTargets = parsedTargets.map( toFormat => ( { target: toFormat[0], segment: toFormat[1] } ) );

	const targetSearch = ( isPresent, type, segment ) => () => {
		let newTargets;
		if ( isPresent ) {
			// remove if we already have this target
			newTargets = parsedTargets.filter( parsedTarget => parsedTarget[1] ? ( parsedTarget[0] !== type || parsedTarget[1] !== segment ) : parsedTarget[0] !== type );
		} else {
			// otherwise add new target to list and push to history
			newTargets = parsedTargets.concat( [ [ type, segment ] ] );
		}
		setParam( 'targeting', newTargets.length ? JSON.stringify( newTargets ) : '' );
	};

	return (
		<div className={cx( 'container' )}>
			{
				targets.map( ( target, idx ) => {
					const isPresent = formattedParsedTargets.some( item => target.target === item.target && target.segment === item.segment );
					return (
						<TargetButton key={`${target.segment}-${idx}`} target={target} targetSearch={targetSearch} isPresent={isPresent} inAd={inAd} />
					);
				} )
			}
		</div>
	);
};

Targets.propTypes = {
	getParam: PropTypes.func.isRequired,
	setParam: PropTypes.func.isRequired,
	targets: PropTypes.array.isRequired,
};

const WrappedTargets = withURLSearchParams( Targets );
export const AdTargeting = withURLSearchParams( UnwrappedAdTargeting )
export default WrappedTargets;
