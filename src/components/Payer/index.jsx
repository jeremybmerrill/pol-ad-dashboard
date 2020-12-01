import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import { Progress } from 'semantic-ui-react';
import classnames from 'classnames/bind';
import AdSearch from 'components/AdSearch';
import Targets from 'components/Targets';
import styles from './Payer.module.css';
import { withAPI } from 'api';

const cx = classnames.bind( styles );

const COLORS = [ 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey' ];

const findColor = ( idx ) => {
  if ( COLORS[idx] ) {
    return COLORS[idx];
  }
  return findColor( idx - COLORS.length );
};

const Payer = ( { search } ) => {
  const [ payerData, setPayerData ] = useState( null );
  const { payer } = useParams();

  useEffect( () => {
    const getPayerData = async () => {
      const data = await search( {'payers': [JSON.stringify([payer])] } );
      setPayerData( data );
    };
    getPayerData();
  }, [ payer, search ] );

  if ( !payerData ) {
    return (
      <div className={cx( 'container' )}>
        <div className={cx( 'payer-container' )}>
          <h2>{payer}</h2>
        </div>
      </div>
    );
  }

  const {
    ads,
    fbpac_ads,
    advertisers,
    precise_spend,
    topics,
    targetings,
    notes
  } = payerData;

  return (
    <div className={cx( 'container' )}>
      <div className={cx( 'payer-container' )}>
        <h2>{payer.toString()}</h2>
        <div className={cx( 'adv-section', 'spend' )}>
          <div>{precise_spend ? `$${precise_spend.toString().replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' )} spent` : 'Unknown spend'}</div>
          <div>{0} Facebook API ads</div>
          <div>{ads.length || 0} FBPAC ads</div>
          <div>{notes}</div>
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
          <h4>Pages used by payer</h4>
          <p>
            {
              advertisers &&
              advertisers
                .map( page => <Link key={page.page_name} className={cx( 'link' )} to={`/advertiser/${encodeURI( page.page_name )}`}>{page.page_name}</Link> )
                .reduce( ( accum, page, idx ) => {
                  // add commas
                  const next = [ page, ( <span className={cx( 'comma' )}>,</span> ) ];
                  if ( idx === advertisers.length - 1 ) {
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
                Targeting Methods Used
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

Payer.propTypes = {
  search: PropTypes.func.isRequired,
};

export default withAPI( Payer );
