import React from 'react';
// render function to insert React component to frontend 
import { render } from 'react-dom';
import App from './components/App';

// jsx
render(
    <App />,    
    document.getElementById('root')
);

