import React, { Fragment } from 'react';
import { Redirect, Route } from 'react-router-dom';
import Layout from 'components/Layout';
import AdSearch from 'components/AdSearch';
import Advertiser from 'components/Advertiser';
import Payer from 'components/Payer';
import AdDetail from 'components/AdDetail';
import Pivot from 'components/Pivot';

const Routes = () => (
	<Fragment>
		<Layout>
			<Route exact path="/">
				<Redirect to="/search" />
			</Route>
			<Route path="/search" component={AdSearch} />
			<Route path="/advertiser/:page_id" component={Advertiser} />
			<Route path="/payer/:payer" component={Payer} /> 
		    <Route path="/ad/:ad_id" component={AdDetail} />
		    <Route path="/pivot/" component={Pivot} />
		</Layout>
	</Fragment>
)

export default Routes;
