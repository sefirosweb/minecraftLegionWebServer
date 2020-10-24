import React from 'react'

import Navbar from './NavbarLayout'



function Layout(props) {
    return (
        <React.Fragment>
            <Navbar />
            <div className='container'>
                {props.children}
            </div>
        </React.Fragment>
    )
}

export default Layout