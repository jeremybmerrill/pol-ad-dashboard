import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withURLSearchParams } from 'utils';
import { Button, Divider, Icon, Label } from 'semantic-ui-react';
import classnames from 'classnames/bind';
import styles from './Targets.module.css';
import { filterDataToButtons } from './transformTargeting'

const cx = classnames.bind( styles );

// these are the buttons that show up at the top of the search sidebar, showing which filters are currently enabled.
export const TargetFilters = ( { getParam } ) => {
	const targets = JSON.parse( getParam( 'targeting' ) );
	const formattedTargets = [];

	if ( !targets || !targets.length ) {
		return null;
	}

	for ( const targetParam of targets ) {
		formattedTargets.push( filterDataToButtons(... targetParam) );
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
	const { filter_target: type, filter_segment, count } = target;
	return (
		<div className={cx( 'button-group' )}>
			<div className={inAd ? cx('inad') : ''}>
			<Button.Group>
				{
					isPresent
						? (
							<Button className={cx('redx')} icon color="red" onClick={targetSearch( isPresent, type, filter_segment )}>
								<Icon name="close" />
							</Button>
						) : null
				}
				<Button onClick={targetSearch( isPresent, type )} as="a" labelPosition="right">
					{
						count && <Label pointing="right">{count}</Label>
					}
					<Button>
						{target.target_nicename || target.filter_target}
					</Button>
				</Button>
				{
					target.filter_segment
						? (
							<Button color="olive" onClick={targetSearch( isPresent, type, target.filter_segment )}>
								{target.segment_nicename || target.filter_segment}
							</Button>
						) : null
				}
			</Button.Group>
			</div>
		</div>
	);
};

const Targets = ( {
	getParam,
	setParam,
	targets,
	inAd,
	location,
	history
} ) => {
	// get the currently-set targets, so we can know whether to render the X-out button
	const parsedTargets = JSON.parse( getParam( 'targeting' ) ) || [];
	const formattedParsedTargets = parsedTargets.map( toFormat => ( { filter_target: toFormat[0], filter_segment: toFormat[1] } ) );

	const targetSearch = ( isPresent, type, filter_segment ) => () => {
		let newTargets;
		if ( isPresent ) {
			// remove if we already have this target
			newTargets = parsedTargets.filter( parsedTarget => parsedTarget[1] ? ( parsedTarget[0] !== type || parsedTarget[1] !== filter_segment ) : parsedTarget[0] !== type );
		} else {
			// otherwise add new target to list and push to history
			newTargets = parsedTargets.concat( [ [ type, filter_segment ] ] );
		}
		// only sometimes: this.props.history.push('/search')
		if(!['/search', '/advertiser', '/payer'].some((url) => location.pathname.indexOf(url) == 0)){ // these are routes that support filtering.
		    history.push({
		        pathname: '/search',
		        search: "?" + new URLSearchParams({targeting: newTargets.length ? JSON.stringify( newTargets ) : ''})
		    })
		}else{
			setParam( 'targeting', newTargets.length ? JSON.stringify( newTargets ) : '' );
		}
	};

	return (
		<div className={cx( 'container' )}>
			{
				targets.map( ( target, idx ) => {
					const isPresent = formattedParsedTargets.some( item => target.filter_target === item.filter_target && target.filter_segment === item.filter_segment );
					return (
						<TargetButton key={`${target.filter_segment}-${idx}`} target={target} targetSearch={targetSearch} isPresent={isPresent} inAd={inAd} />
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
export default WrappedTargets;
