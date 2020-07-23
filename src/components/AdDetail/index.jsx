import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import { Progress } from 'semantic-ui-react';
import classnames from 'classnames/bind';
import Targets from 'components/Targets';
import AdWrapper from 'components/AdWrapper';
import styles from './AdDetail.module.css';
import { withAPI } from 'api';

const cx = classnames.bind( styles );

const AdDetail = ( { getAdByTextHash } ) => {
  const [ adData, setAdData ] = useState( null );
  const { ad_hash } = useParams();

  useEffect( () => {
    const getAdData = async () => {
      const data = await getAdByTextHash( ad_hash );
      setAdData( data );
    };
    getAdData();
  }, [ ad_hash, getAdByTextHash ] );

  if ( !adData ) {
    return (
      <div className={cx( 'container' )}>
        <div className={cx( 'advertiser-container' )}>
          <h2>{ad_hash}</h2>
        </div>
      </div>
    );
  }
  const {
    text,
    fbpac_ads_count,
    api_ads_count,
    min_spend,
    max_spend,
    min_impressions,
    max_impressions,
    ad
  } = adData;


  return (
    <div className={cx( 'container' )}>
      <div className={cx( 'ad-container' )}>
        <h2>Ad Details</h2>
        <p dangerouslySetInnerHTML={{ __html: text }} />
        <div className={cx( 'adv-section', 'spend' )}>
          <div>{min_spend ? `$${min_spend.toString().replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' )} - $${max_spend.toString().replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' )} spent` : 'Unknown spend'}</div>
          <div>{min_impressions ? `${min_impressions.toString().replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' )} - ${max_impressions.toString().replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' )} impressions` : 'unknown impressions'}</div>
          <div>{api_ads_count || 0} FB API ads</div>
          <div>{fbpac_ads_count || 0} FBPAC ads</div>
          <div>First seen: {ad["created_at"] || null}</div>
          <div>Last seen: {ad["updated_at"] || null}</div>
          <div><a href={ "https://www.facebook.com/ads/library/?id=" + (ad.archive_id || ad.id) }>FB ad library link </a></div>

        </div>

        <AdWrapper adData={ad["variants"]} />
      </div>
    </div>
  );
};

AdDetail.propTypes = {
  getAdByTextHash: PropTypes.func.isRequired,
};

export default withAPI( AdDetail );
