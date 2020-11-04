import React from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';

import AdDetails, { CreativeAd } from './AdDetails';
import classnames from 'classnames/bind';
import {AdTargeting} from '../Targets';
import styles from './Ad.module.css';
import makeAdHtml  from './utilities'
// Facebook-ad specific styling
// eslint-disable-next-line
import './fb_ad.scss';

const cx = classnames.bind( styles );

const isPost2020 = (html) => {
	return true;
}
const post2020HtmlToFakeHtml = (html, images, thumbnail) => {
	return '<div class="ati-item ' + cx('ati-item') + '">' + DOMPurify.sanitize(makeAdHtml(html, images, thumbnail, cx)) + '</div>'
}

const Ad = ( { ad, creativeAd, text } ) => {
	const {
		html,
		targets,
		targetings,
		images
	} = creativeAd;

	if ( !html ) {
		return <AdDetails creativeAd={creativeAd} text={text}/>;
	}

	return (
		<div className={cx( 'container' )}>
			<CreativeAd html={isPost2020(html) ? post2020HtmlToFakeHtml(html, images.map((path) => `https://storage.googleapis.com/facebook_ad_images/${path}`)) : html} />
			{
				targetings && targetings[0]
					? (
						<AdTargeting targets={targetings} inAd={true}/>
					) : null
			}
			<AdDetails ad={ad} creativeAd={creativeAd} text={text} />
		</div>
	);
};

Ad.propTypes = {
	ad: PropTypes.object,
	creativeAd: PropTypes.object,
	text: PropTypes.string,
};

export default Ad;
