import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';
import { TypeWriter } from './TypeWritter';

export const HeroSection = () => {
  const [hasRan, setHasRan] = useState(false);
  const [screenSize, setScreenSize] = useState({ height: 0, width: 0 });
  useEffect(() => {
    if (!hasRan) {
      setHasRan(true);
      updateScreenSize();
    }
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [screenSize, hasRan]);
  const updateScreenSize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setScreenSize({ width, height });
  };
  return (
    <div className="position-relative overflow-hidden mainbg" style={{ width: '100%', height: `${screenSize.height - 40}px` }}>
      <div className="col-md-12 p-lg-5 mx-auto" style={{ marginTop: `${screenSize.height / 4}px` }}>
        <h1 className="display-4 fw-bolder" id="banner-title">
          Grafana Infinity data source
        </h1>
        <br />
        <TypeWriter />
        <br />
        <p className="fw-normal text-white">
          <span style={{ color: '#ccc' }}>Visualize data from JSON, CSV, XML, GraphQL, HTML &amp; REST APIs. Also turns any website into grafana dashboard.</span>
        </p>
        <br />
        <Link className="btn btn-primary text-black" style={{ backgroundImage: 'linear-gradient(#FADE2A,#F05A28)', color: 'black', border: 'none' }} to="/getting-started">
          Getting started
        </Link>
        <a
          className="btn btn-primary text-black mx-4"
          style={{ backgroundImage: 'linear-gradient(#FADE2A,#F05A28)', color: 'black', border: 'none' }}
          href="https://grafana-infinity-datasource.herokuapp.com"
          target="_blank"
          rel="noreferrer"
        >
          Try online
        </a>
      </div>
    </div>
  );
};
