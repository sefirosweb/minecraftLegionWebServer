import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import confLogo from '../images/sefiros.png'
import '../css/NavbarLayout.css'

class NavbarLayout extends React.Component {
    render() {
        return (
            <div className='navBar'>
                <NavLink to="/dashboard" activeClassName="is-selected">Dashboard</NavLink>
                <NavLink to="/configuration" activeClassName="is-selected">Configuration</NavLink>
                <a className='' href='https://github.com/sefirosweb/minecraftLegion' target='_blank' rel="noreferrer">Git</a>
            </div >
        )
    }
}

export default NavbarLayout