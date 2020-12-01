import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import styles from './Pivot.module.css';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { withAPI } from 'api';
import { compose, withURLSearchParams } from 'utils';
import Targets from 'components/Targets';
import { targetingLineToButtons } from 'components/Targets/transformTargeting.js'
import { Pagination } from 'semantic-ui-react';

  
const cx = classnames.bind( styles );

const numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

const PAGE_SIZE = 500

const Pivot = ({ getSummaryData, setParam, location: { search } }) => {
  const [ pivotData, setPivotData ] = useState( null );
  const { kind, time_unit, time_count, first_seen, page } = Object.fromEntries((new URLSearchParams( search )).entries());

  useEffect( () => {
    const getPivotData = async () => {
      const data = await getSummaryData( {kind: kind, time_unit: time_unit, time_count: time_count, first_seen: first_seen} );
      setPivotData( data );
    };
    getPivotData();
  }, [ kind, time_unit, time_count, first_seen, getSummaryData ] );

  if ( !pivotData ) {
    return (
      <div className={cx( 'tools' )}>
        <h2>top { kind } {first_seen ? "FIRST seen" : "seen" } { typeof time_unit === 'undefined' ? 'ever' : `in the past ${time_count} ${time_unit}` }  </h2>
        <h3> loading</h3>
      </div>
    );
  }

  return (<div className={cx( 'tools' )}>
  <h2>top { kind } {first_seen ? "FIRST seen" : "seen" }  { typeof time_unit === 'undefined' ? 'ever' : `in the past ${time_count} ${time_unit}` } </h2>

  <div id="top-pages-panel">
    { pivotData.length > PAGE_SIZE ? <Pagination defaultActivePage={typeof page === 'undefined' ? 0 : page } totalPages={Math.ceil(pivotData.length/PAGE_SIZE)} onPageChange={(event, data) => setParam('page', data.activePage)} /> : null }
    <table>
      <tbody>
      { pivotData.slice((typeof page === 'undefined' ? 0 : page) * PAGE_SIZE, ((typeof page === 'undefined' ? 0 : page) + 1) * PAGE_SIZE).map(([thing, cnt]) => (
        <tr key={thing}>
          <td>

            {
              (kind === "targets") ? <Targets targets={targetingLineToButtons(thing[0], null)} />
               : (kind === "segments" ? <Targets targets={targetingLineToButtons(thing[0], thing[1])} /> :
              (<Link to={ kind === "paid_for_by" ? (`/payer/${ thing[0] }`) : (
                               kind === "advertiser" ? (`/advertiser/${ thing[1] }`  ) : ('/'
                             )) }>
                            {(thing[0] || '(none)')}
                            </Link>))

            }
         </td>
          <td>{ numberWithCommas(cnt) }</td>
        </tr>
      )) }
      </tbody>
    </table>
    { pivotData.length > PAGE_SIZE ? <Pagination defaultActivePage={typeof page === 'undefined' ? 0 : page } totalPages={Math.ceil(pivotData.length/PAGE_SIZE)} onPageChange={(event, data) => setParam('page', data.activePage)} /> : null }
  </div>
  </div>);
};



Pivot.propTypes = {
  getSummaryData: PropTypes.func.isRequired,
  setParam: PropTypes.func.isRequired,
};

export default compose( withAPI, withURLSearchParams )( Pivot );
