import React from 'react';
import styles from './Tools.module.css';
import classnames from 'classnames/bind';
import { Link } from 'react-router-dom';

const cx = classnames.bind( styles );

const Tools = () => (
<div className={cx( 'tools' )}>
{/*  <h4>Heuristics</h4>
  <li><a href="https://dashboard-backend.ad-observatory.com/bigspenders">Big spenders this week</a></li>
  <li><a href="https://dashboard-backend.ad-observatory.com/ads/swing_state_ads">Swing-state ads (persuasive ads?)</a></li>*/}
  <h4>Advertisers</h4>
  <ul>
    <li><Link to="/pivot?kind=advertiser&time_unit=week&time_count=1&first_seen=1">New this week</Link></li>
    <li><Link to="/pivot?kind=advertiser&time_unit=week&time_count=1">Seen this week</Link></li>
    <li><Link to="/pivot?kind=advertiser&time_unit=month&time_count=3&first_seen=1">New past 3 months</Link></li>
    <li><Link to="/pivot?kind=advertiser&time_unit=month&time_count=3">Seen past 3 months</Link></li>
    <li><Link to="/pivot?kind=advertiser&time_unit=electioncycle&time_count=1">Seen this election cycle</Link></li>
    <li><Link to="/pivot?kind=advertiser">Seen ever</Link></li>
  </ul>
  <h4>Payers</h4>
  <ul>
    <li><Link to="/pivot?kind=paid_for_by&time_unit=week&time_count=1&first_seen=1">New this week</Link></li>
    <li><Link to="/pivot?kind=paid_for_by&time_unit=week&time_count=1">Seen this week</Link></li>
    <li><Link to="/pivot?kind=paid_for_by&time_unit=month&time_count=3&first_seen=1">New past 3 months</Link></li>
    <li><Link to="/pivot?kind=paid_for_by&time_unit=month&time_count=3">Seen past 3 months</Link></li>
    <li><Link to="/pivot?kind=paid_for_by&time_unit=electioncycle&time_count=1">Seen this election cycle</Link></li>
    <li><Link to="/pivot?kind=paid_for_by">Seen ever</Link></li>
  </ul>
{/*  Commented out 12/3/2020 by JBFM -- this is too slow of a query to use in a live site... for now.
  <h4>Segments</h4> 
  <ul>
    <li><Link to="/pivot?kind=segments&time_unit=week&time_count=1&first_seen=1">New this week</Link></li>
    <li><Link to="/pivot?kind=segments&time_unit=week&time_count=1">Seen this week</Link></li>
    <li><Link to="/pivot?kind=segments&time_unit=month&time_count=3&first_seen=1">New past 3 months</Link></li>
    <li><Link to="/pivot?kind=segments&time_unit=month&time_count=3">Seen past 3 months</Link></li>
    <li><Link to="/pivot?kind=segments&time_unit=electioncycle&time_count=1">Seen this election cycle</Link></li>
    <li><Link to="/pivot?kind=segments">Seen ever</Link></li>
  </ul>
*/}  <h4>Custom Audience Owners</h4>
  <ul>
    <li><Link to="/pivot?kind=list_uploaders&time_unit=week&time_count=1&first_seen=1">New this week</Link></li>
    <li><Link to="/pivot?kind=list_uploaders&time_unit=week&time_count=1">Seen this week</Link></li>
    <li><Link to="/pivot?kind=list_uploaders&time_unit=month&time_count=3&first_seen=1">New past 3 months</Link></li>
    <li><Link to="/pivot?kind=list_uploaders&time_unit=month&time_count=3">Seen past 3 months</Link></li>
    <li><Link to="/pivot?kind=list_uploaders&time_unit=electioncycle&time_count=1">Seen this election cycle</Link></li>
    <li><Link to="/pivot?kind=list_uploaders">Seen ever</Link></li>
  </ul>
</div>);

export default Tools;
