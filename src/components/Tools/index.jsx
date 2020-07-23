import React from 'react';
import styles from './Tools.module.css';
import classnames from 'classnames/bind';

const cx = classnames.bind( styles );

const Tools = () => (
<div className={cx( 'tools' )}>
  <h4>Heuristics</h4>
  <li><a href="https://dashboard-backend.ad-observatory.com/bigspenders">Big spenders this week</a></li>
  <li><a href="https://dashboard-backend.ad-observatory.com/ads/swing_state_ads">Swing-state ads (persuasive ads?)</a></li>
  <h4>Advertisers</h4>
  <ul>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/advertiser?time_unit=week&time_count=1&first_seen=1">New this week</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/advertiser?time_unit=week&time_count=1">Seen this week</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/advertiser?time_unit=month&time_count=3&first_seen=1">New past 3 months</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/advertiser?time_unit=month&time_count=3">Seen past 3 months</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/advertiser?time_unit=electioncycle&time_count=1">Seen this election cycle</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/advertiser">Seen ever</a></li>
  </ul>
  <h4>Payers</h4>
  <ul>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/paid_for_by?time_unit=week&time_count=1&first_seen=1">New this week</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/paid_for_by?time_unit=week&time_count=1">Seen this week</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/paid_for_by?time_unit=month&time_count=3&first_seen=1">New past 3 months</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/paid_for_by?time_unit=month&time_count=3">Seen past 3 months</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/paid_for_by?time_unit=electioncycle&time_count=1">Seen this election cycle</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/paid_for_by">Seen ever</a></li>
  </ul>
  <h4>Segments</h4>
  <ul>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/segments?time_unit=week&time_count=1&first_seen=1">New this week</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/segments?time_unit=week&time_count=1">Seen this week</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/segments?time_unit=month&time_count=3&first_seen=1">New past 3 months</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/segments?time_unit=month&time_count=3">Seen past 3 months</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/segments?time_unit=electioncycle&time_count=1">Seen this election cycle</a></li>
    <li><a href="https://dashboard-backend.ad-observatory.com/ads/pivot/segments">Seen ever</a></li>
  </ul>
</div>);

export default Tools;
