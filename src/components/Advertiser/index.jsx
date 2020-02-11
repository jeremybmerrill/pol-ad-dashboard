import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import { Progress } from 'semantic-ui-react';
import classnames from 'classnames/bind';
import AdSearch from 'components/AdSearch';
import Targets from 'components/Targets';
import styles from './Advertiser.module.css';
import { withAPI } from 'api';

const cx = classnames.bind( styles );

const COLORS = [ 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey' ];

const findColor = ( idx ) => {
	if ( COLORS[idx] ) {
		return COLORS[idx];
	}
	return findColor( idx - COLORS.length );
};

const Advertiser = ( { getAdvertiserByName } ) => {
	const [ advertiserData, setAdvertiserData ] = useState( null );
	const { advertiser } = useParams();

	useEffect( () => {
		const getAdvertiserData = async () => {
			const data = await getAdvertiserByName( advertiser );
			setAdvertiserData( data );
		};
		getAdvertiserData();
	}, [ advertiser, getAdvertiserByName ] );

	if ( !advertiserData ) {
		return (
			<div className={cx( 'container' )}>
				<div className={cx( 'advertiser-container' )}>
					<h2>{advertiser}</h2>
				</div>
			</div>
		);
	}

	const {
		ads,
		fbpac_ads,
		payers,
		precise_spend,
		topics,
		targetings,
	} = advertiserData;

	return (
		<div className={cx( 'container' )}>
			<div className={cx( 'advertiser-container' )}>
				<h2>{advertiser}</h2>
				<div className={cx( 'adv-section', 'spend' )}>
					<div>{precise_spend ? `$${precise_spend.toString().replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' )} spent` : 'Unknown spend'}</div>
					<div>{ads || 0} ads</div>
					<div>{fbpac_ads || 0} FBPAC ads</div>
				</div>
				<div className={cx( 'adv-section', 'topics' )}>
					<h4>Topic Coverage</h4>
					{
						topics && Object.keys( topics ).map( ( topicKey, idx ) => {
							const targetPercent = topics[topicKey];
							const color = findColor( idx );
							return (
								<div key={topicKey}>
									<p className={cx( 'topic-label' )}>
										<span>{topicKey}</span><span>{Math.round( targetPercent * 100 )}%</span>
									</p>
									<Progress percent={Math.round( targetPercent * 100 )} size="tiny" color={color} />
								</div>
							);
						} )
					}
				</div>
				<div className={cx( 'adv-section' )}>
					<h4>Payers</h4>
					<p>
						{
							payers &&
							payers
								.map( payer => <Link key={payer.name} className={cx( 'link' )} to={`/search?search=${encodeURI( payer.name )}`}>{payer.name}</Link> )
								.reduce( ( accum, payer, idx ) => {
									// add commas
									const next = [ payer, ( <span className={cx( 'comma' )}>,</span> ) ];
									if ( idx === payers.length - 1 ) {
										next.pop();
									}
									return accum.concat( next );
								}, [] )
						}
					</p>
				</div>
				{
					targetings && targetings.individual_methods && targetings.individual_methods.length > 0 && (
						<details className={cx( 'adv-section', 'targeting' )}>
							<summary className={cx( 'summary' )}>
								Count of Advertiser Targets
							</summary>
							<Targets targets={targetings.individual_methods} />
						</details>
					)
				}
			</div>
			<AdSearch />
		</div>
	);
};

Advertiser.propTypes = {
	getAdvertiserByName: PropTypes.func.isRequired,
};

export default withAPI( Advertiser );
