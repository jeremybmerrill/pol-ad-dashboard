import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Divider } from 'semantic-ui-react';
import { withURLSearchParams } from 'utils';
import { COMMON_TARGETS_GROUPED } from '../constants';
import Targets, { TargetFilters } from 'components/Targets';
import { filterDataToButtons } from '../Targets/transformTargeting'
import Topics from 'components/Topics';
import CountryDropdown from 'components/CountryDropdown';
import Tools from 'components/Tools'
import Credits from 'components/Credits'
import classnames from 'classnames/bind';
import Search from 'components/Search';
import styles from './Layout.module.css';
import { Link } from 'react-router-dom';
import { DEFAULT_MIN_POLIPROB, DEFAULT_TO_SHOW_ONLY_POLITICAL } from '../constants'

const cx = classnames.bind( styles );

const CommonTargets = () => (
	<div className={cx( 'search-targets' )}>
		<h4 className={cx( 'title' )}>Common Targets:</h4>
		<ul className={cx( 'target-list' )}>
			{
				Object.keys( COMMON_TARGETS_GROUPED ).sort().map( ( target, idx ) => {
					const vals = COMMON_TARGETS_GROUPED[target]
					return (
						<li className={cx( 'target-item' )} key={idx}>
							<details className={cx( 'target-details' )}>
								<summary>
									{target}
								</summary>
								<div className={cx( 'target-group' )}>
									<Targets targets={vals.map((val) => filterDataToButtons(...val))} />
								</div>
							</details>
						</li>
					);
				} )
			}
		</ul>
	</div>
);

const Layout = ( {
	children,
	getParam,
	history,
	location: { search, pathname },
	toggleParam,
	setParam
} ) => (
	<div className={cx( 'layout' )}>
		<div className={cx( 'left-rail' )}>
			<h1><Link to="/">Ad Observer dashboard</Link></h1>
			{
				pathname === '/search' && (
					<Fragment>
						<Button onClick={() => history.push( pathname )}>
							Clear All Filters
						</Button>
						<Divider />
					</Fragment>
				)
			}
			<Search />
			<Divider />
{/*			<Checkbox
				label="Only crowdsourced collector ads"
				checked={search.includes( 'only_fbpac=true' )}
				onClick={() => toggleParam( 'only_fbpac' )}
				className={cx('checkbox')}
			/> */}	
	 		<Checkbox
				label="Show all ads, regardless of political classification"
				checked={ (new URLSearchParams(search)).get("poliprob") ? JSON.parse((new URLSearchParams(search)).get("poliprob"))[0] != DEFAULT_MIN_POLIPROB : !DEFAULT_TO_SHOW_ONLY_POLITICAL }
				onClick={(e, data) => setParam( 'poliprob', JSON.stringify([data.checked ? 0 : DEFAULT_MIN_POLIPROB, 100] )) }
				className={cx('checkbox')}
			/>			
	 		<Checkbox
				label="Only ads without 'Paid For By' disclaimer"
				checked={search.includes( 'no_payer=true' )}
				onClick={() => toggleParam( 'no_payer' )}
				className={cx('checkbox')}
			/>
			<Divider />
			<CountryDropdown />
{/*			<Topics /> */}			
			<TargetFilters getParam={getParam} />
			<Divider />
			<CommonTargets />

			<Credits />
			<Tools />
		</div>
		<div className={cx( 'content' )}>
			{
				children
			}
		</div>
	</div>
);

Layout.propTypes = {
	children: PropTypes.node,
	getParam: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
	location: PropTypes.shape( {
		search: PropTypes.string,
		pathname: PropTypes.string.isRequired,
	} ),
	toggleParam: PropTypes.func.isRequired,
}

export default withURLSearchParams( Layout );
