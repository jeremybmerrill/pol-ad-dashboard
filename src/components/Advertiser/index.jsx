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

const Advertiser = ( { search } ) => {
	const [ advertiserData, setAdvertiserData ] = useState( null );
	const { page_id } = useParams();

	useEffect( () => {
		const getAdvertiserData = async () => {
			const data = await search( {'page_ids': [JSON.stringify([page_id])] } );
			setAdvertiserData( data );
		};
		getAdvertiserData();
	}, [ page_id, search ] );

	if ( !advertiserData ) {
		return (
			<div className={cx( 'container' )}>
				<div className={cx( 'advertiser-container' )}>
					<h2>{page_id.toString()}</h2>
				</div>
			</div>
		);
	}

	const {
		ads,
		payers,
		precise_spend,
		topics,
		targetings,
		notes
	} = advertiserData;

	return (
		<div className={cx( 'container' )}>
			<div className={cx( 'advertiser-container' )}>
				<h2>{ads[0]["advertiser"]}</h2>
				<div className={cx( 'adv-section', 'spend' )}>
					<div>{precise_spend ? `$${precise_spend.toString().replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' )} spent` : 'Unknown spend'}</div>
					<div>{0} Facebook API ads</div>
					<div>{ads.length || 0} Ad Observer ads</div>
					<div>{notes}</div>
				</div>
				<div className={cx( 'adv-section', 'topics' )}>
					<h4>Topic Coverage</h4>
					{
						topics && Object.keys( topics ).sort((a, b) => topics[b] - topics[a]).map( ( topicKey, idx ) => {
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
					<h4>Paid for by disclaimers used by this page</h4>
					<p>
						{
							payers &&
							payers
								.map( payer => <Link key={payer.name} className={cx( 'link' )} to={`/payer/${encodeURI( payer.name )}`}>{payer.name}</Link> )
								.reduce( ( accum, payer, idx ) => {
									// add commas
									const next = [ payer, ( <span key={"comma-" + idx} className={cx( 'comma' )}>,</span> ) ];
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
								Targeting methods used
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
	search: PropTypes.func.isRequired,
};

export default withAPI( Advertiser );
