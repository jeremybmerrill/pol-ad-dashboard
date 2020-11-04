import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Modal } from 'semantic-ui-react';
import classnames from 'classnames/bind';
import styles from './AdDetails.module.css';

const cx = classnames.bind( styles );

// export const CreativeAd = ( { html } ) => <div dangerouslySetInnerHTML={{ __html: html }} />;

export class CreativeAd extends React.Component {
  constructor(props) {
    super(props);
    this.adRef = React.createRef();
  }
  componentDidMount() {
    if (!this.adRef || !this.adRef.current) return;
    const link = this.adRef.current.querySelector(".see_more_link");
    if (!link) return;
    link.addEventListener("click", (event) => {
    	event.preventDefault();
      this.adRef.current.querySelector(".text_exposed_hide").style.display =
        "none";
      this.adRef.current.querySelector(".see_more_link").style.display = "none";
      this.adRef.current
        .querySelectorAll(".text_exposed_show")
        .forEach(node => (node.style.display = "inline"));
    });
  }

  render(){
  	return <div ref={this.adRef} dangerouslySetInnerHTML={{ __html: this.props.html }} />;
  }
}

const AdDetails = ( { ad, creativeAd, text } ) => {
	const { currency } = ad ? ad.ads.find( subAd => !subAd.id ) : { currency: 'USD' }; // find the FBPAC version of the ad which contains more price data
	const {
		advertiser,
		observed_at_min,
		impressions,
		paid_for_by,
		observed_at_max,
		html,
		text_hash,
		ad_creative_link_caption,
		ad_creative_link_title,
		ad_creative_link_description,
		id
	} = creativeAd;

	const observedAtMin = new Date( observed_at_min );
	const observedAtMax = new Date( observed_at_max );

	return (
		<div
			className={cx( 'details-container' )}
		>
			<div>
			<h4 className={cx( 'title' )}><Link to={`/advertiser/${encodeURI( advertiser )}`}>{advertiser}</Link></h4>
			<h4 className={cx( 'paid-for' )}>Paid for by: {paid_for_by || 'Unknown'}</h4>
			<p className={cx( 'text' )}>{text}</p>
			<p className={cx( 'text' )}>{ad_creative_link_caption}</p>
			<p className={cx( 'text' )}>{ad_creative_link_title}</p>
			<p className={cx( 'text' )}>{ad_creative_link_description}</p>

			{
				impressions
					? (
						<p className={cx( 'sub' )}>
							<span>{`${currency}`}</span> • <span>{`${impressions} ${impressions > 1 ? 'impressions' : 'impression'}`}</span>
						</p>
					) : null
			}
			<p className={cx( 'sub' )}>
				<span>First seen: {`${observedAtMin.toLocaleDateString( 'en-US', { dateStyle: 'full' } )}`}</span>
			</p>
			{
				observedAtMax
					? (
						<p className={cx( 'sub' )}>
							<span>Last seen: {`${observedAtMax.toLocaleDateString( 'en-US', { dateStyle: 'full' } )}`}</span>
						</p>
					) : null
			}
{/*			<Modal
				dimmer="inverted"
				size="fullscreen"
				trigger={<Button>Ad Details</Button>}
				style={{
					minHeight: '80vh',
				}}
			>
				<div className={cx( 'modal-content' )}>
					<CreativeAd html={html} />
					<div className={cx( 'right-rail' )}>
						<p>Placeholder content (awaiting further ad data)</p>
					</div>
				</div>
			</Modal>
*/}	
			<Link to={'/ad/' + text_hash }>Ad Details</Link>
			{
				html ? <span> • <a href={ "https://www.facebook.com/ads/library/?id=" + (id) }>FB ad library</a></span> : null
			}
          	
			</div>
		</div>
	);
};

AdDetails.propTypes = {
	ad: PropTypes.object,
	creativeAd: PropTypes.object,
};

export default AdDetails;
