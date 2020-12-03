import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom'
import styles from './Pivot.module.css';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { withAPI } from 'api';
import { compose, withURLSearchParams } from 'utils';
import Targets from 'components/Targets';
import { targetingLineToButtons } from 'components/Targets/transformTargeting.js'
import { Pagination } from 'semantic-ui-react';
import SmartDataTable from 'react-smart-data-table'
import _ from "lodash";

import 'react-smart-data-table/dist/react-smart-data-table.css'
const cx = classnames.bind( styles );

const numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

const PAGE_SIZE = 500


const Pivot = ({ getSummaryData, setParam, location: { search } }) => {
  const [ pivotData, setPivotData ] = useState( null );
  const [ filterValue, setFilterValue ] = useState( '' );
  const { kind, time_unit, time_count, first_seen } = Object.fromEntries((new URLSearchParams( search )).entries());

  useEffect( () => {
    const getPivotData = async () => {
      const data = await getSummaryData( {kind: kind, time_unit: time_unit, time_count: time_count, first_seen: first_seen} );
      setPivotData( data );
    };
    getPivotData();
  }, [ kind, time_unit, time_count, first_seen, getSummaryData ] );

  const history = useHistory();
  const navigateToElement = (event, { rowData }) => {
    console.log(rowData)
    if (kind === "advertiser"){
      history.push(`/advertiser/${ rowData[`${kind}.1`] }`)
    }else if (kind === "paid_for_by"){
      history.push( `/payer/${ rowData[`${kind}.0`] }`)
    }else{
      history.push('/search')
      setParam( 'targeting', JSON.stringify( targetingLineToButtons(...rowData.kind[`${kind}.0`]) ));
    }
  }

  const targetingDataToPair = (category, subcategory) => {
    const res = targetingLineToButtons(category, subcategory);
    console.log(res);
    return {"targets": res.map((row) => row.target_nicename || row.filter_target ).join(" / "), "subcategory": res.map((row) => row.segment_nicename || row.filter_segment ).join(" / ")}
  }

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
  <div className={'ui icon input'}>
    <input
      type='text'
      name='filterValue'
      value={filterValue}
      placeholder='Filter results...'
      onChange={({target: { value } }) => { console.log(value); return setFilterValue(value)} }
    />
    <i className={'search icon'} />
  </div>


{/*.map(([thing, cnt]) => 
              ({[kind]: (kind === "targets") ? <Targets targets={targetingLineToButtons(thing[0], null)} /> : 
                        (kind === "segments" ? <Targets targets={targetingLineToButtons(thing[0], thing[1])} /> :
                        (<Link to={ kind === "paid_for_by" ? (`/payer/${ thing[0] }`) : (kind === "advertiser" ? (`/advertiser/${ thing[1] }`  ) : ('/')) }>{(thing[0] || '(none)')}</Link>)), 
               "count": numberWithCommas(cnt)
             }))
*/}
  <SmartDataTable data={pivotData.map(([thing, cnt]) => ({...(["targets", "segments"].includes(kind) ? targetingDataToPair(...thing) : {[kind]: thing[0]}), "count": numberWithCommas(cnt)}))}  name="test-table"
    className="ui compact selectable table"
    filterValue={filterValue}
    perPage={PAGE_SIZE}
    onRowClick={navigateToElement}
    orderedHeaders={[...(kind == "segments" ? ["targets", "subcategory"] : [kind]), 'count']}
    headers=       {[...(kind == "segments" ? ["targets", "subcategory"] : [kind]), 'count']}
    hideUnordered
     />
  
  </div>
  );
};



Pivot.propTypes = {
  getSummaryData: PropTypes.func.isRequired,
  setParam: PropTypes.func.isRequired,
};

export default compose( withAPI, withURLSearchParams )( Pivot );
