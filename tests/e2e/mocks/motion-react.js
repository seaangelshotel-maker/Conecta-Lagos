import React from 'react';
const strip = ({ initial, animate, exit, transition, layout, whileHover, whileTap, ...rest }) => rest;
export const motion = new Proxy({}, { get: (_, tag) => React.forwardRef((p, ref) => React.createElement(tag, { ...strip(p), ref })) });
export const AnimatePresence = ({ children }) => React.createElement(React.Fragment, null, children);
