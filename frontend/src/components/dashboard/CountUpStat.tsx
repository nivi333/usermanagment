import React from 'react';
import CountUp from 'react-countup';
import { Typography } from 'antd';

interface CountUpStatProps {
  label: string;
  value: number;
  color?: string;
}

const CountUpStat: React.FC<CountUpStatProps> = ({ label, value, color }) => (
  <div>
    <Typography.Text style={{ color, fontWeight: 500 }}>{label}</Typography.Text>
    <br />
    <Typography.Title level={4} style={{ margin: 0, color }}>
      <CountUp end={value} duration={1.2} separator="," />
    </Typography.Title>
  </div>
);

export default CountUpStat;
