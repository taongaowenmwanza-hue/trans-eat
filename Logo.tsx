import React from 'react';
import Svg, { Rect, Circle, Ellipse, Path, G } from 'react-native-svg';

const Logo = ({ width = 100, height = 100 }: { width?: number; height?: number }) => {
  const scale = width / 100;
  return (
    <Svg width={width} height={height * 0.85} viewBox="0 0 100 85">
      <G transform={`scale(${scale})`}>
        {/* Bus body */}
        <Rect x="5" y="30" width="90" height="38" rx="8" fill="white" />
        
        {/* Windows */}
        <Rect x="14" y="35" width="16" height="11" rx="3" fill="#0A0A0A" opacity="0.8" />
        <Rect x="34" y="35" width="16" height="11" rx="3" fill="#0A0A0A" opacity="0.8" />
        <Rect x="54" y="35" width="16" height="11" rx="3" fill="#0A0A0A" opacity="0.8" />
        <Rect x="74" y="35" width="12" height="11" rx="3" fill="#0A0A0A" opacity="0.8" />
        
        {/* Orange stripe */}
        <Rect x="5" y="52" width="90" height="3" rx="1.5" fill="#CB2602" />
        
        {/* Wheels */}
        <Circle cx="25" cy="68" r="10" fill="#1a1a1a" />
        <Circle cx="75" cy="68" r="10" fill="#1a1a1a" />
        <Circle cx="25" cy="68" r="5" fill="#333" />
        <Circle cx="75" cy="68" r="5" fill="#333" />
        
        {/* Plate */}
        <Ellipse cx="50" cy="16" rx="28" ry="8" fill="#CB2602" />
        <Ellipse cx="50" cy="14" rx="20" ry="5" fill="#f98015" />
        
        {/* Steam */}
        <Path d="M 32 4 Q 35 0 33 -5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
        <Path d="M 42 2 Q 45 -2 43 -7" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
        <Path d="M 52 4 Q 55 0 53 -5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
      </G>
    </Svg>
  );
};

export default Logo;